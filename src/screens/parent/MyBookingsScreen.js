import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiRequest } from "../../api/client";
import AvatarInitials from "../../components/AvatarInitials";
import StatusPill from "../../components/StatusPill";
import FilterChip from "../../components/FilterChip";

const MyBookingsScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await apiRequest("/api/bookings", { method: "GET" });
      const items = Array.isArray(res?.data) ? res.data : [];
      setBookings(items);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    await fetchBookings();
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const handleCancelBooking = (booking) => {
    Alert.alert(
      "Cancel Booking",
      `Are you sure you want to cancel booking ${booking.bookingRef}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await apiRequest(`/api/bookings/${booking._id}/cancel`, {
                method: "PUT",
                body: { reason: "Cancelled by parent" },
              });
              Alert.alert("Success", "Booking cancelled successfully");
              fetchBookings();
            } catch (error) {
              Alert.alert("Error", "Failed to cancel booking");
            }
          },
        },
      ]
    );
  };

  const openReviewModal = (booking) => {
    setReviewBooking(booking);
    setReviewRating(0);
    setReviewComment("");
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      Alert.alert("Rating Required", "Please select a star rating");
      return;
    }
    if (!reviewComment.trim()) {
      Alert.alert("Comment Required", "Please write a review comment");
      return;
    }

    setIsSubmittingReview(true);
    try {
      await apiRequest("/api/reviews", {
        method: "POST",
        body: {
          bookingId: reviewBooking._id,
          rating: reviewRating,
          comment: reviewComment.trim(),
        },
      });

      setShowReviewModal(false);
      setReviewBooking(null);
      setReviewRating(0);
      setReviewComment("");
      Alert.alert("Success", "Your review has been submitted!");
      fetchBookings();
    } catch (error) {
      Alert.alert("Error", error?.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const StarRatingInput = ({ rating, onRate }) => {
    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => onRate(star)} activeOpacity={0.8}>
            <Ionicons
              name={star <= rating ? "star" : "star-outline"}
              size={32}
              color={star <= rating ? "#F59E0B" : "#E5E7EB"}
              style={{ marginRight: 8 }}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getFilteredBookings = () => {
    if (activeFilter === "all") return bookings;
    return bookings.filter((b) => b.status === activeFilter);
  };

  const filteredBookings = getFilteredBookings();

  const filters = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

  const getFilterLabel = (filter) => {
    const count = bookings.filter((b) => b.status === filter.toLowerCase()).length;
    return filter === "All" ? `All (${bookings.length})` : `${filter} (${count})`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F7", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6C3FCF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F7" }}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 24, fontWeight: "500", color: "#1A1A1A", marginBottom: 4 }}>
          My Bookings
        </Text>
        <Text style={{ fontSize: 14, color: "#6B7280" }}>
          Track and manage your tutoring sessions
        </Text>
      </View>

      {/* Filter Chips */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        {filters.map((filter) => (
          <FilterChip
            key={filter}
            label={getFilterLabel(filter)}
            selected={activeFilter === filter.toLowerCase()}
            onPress={() => setActiveFilter(filter.toLowerCase())}
            size="small"
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C3FCF" />}
      >
        {filteredBookings.length === 0 ? (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              padding: 40,
              alignItems: "center",
            }}
          >
            <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
            <Text style={{ fontSize: 16, color: "#6B7280", marginTop: 12, fontWeight: "500" }}>
              No {activeFilter !== "all" ? activeFilter : ""} bookings
            </Text>
            <Text style={{ fontSize: 14, color: "#9CA3AF", marginTop: 4, textAlign: "center" }}>
              {activeFilter === "all"
                ? "You haven't made any bookings yet"
                : `You don't have any ${activeFilter} bookings`}
            </Text>
            {activeFilter === "all" && (
              <TouchableOpacity
                onPress={() => navigation.navigate("Search")}
                activeOpacity={0.8}
                style={{
                  backgroundColor: "#6C3FCF",
                  borderRadius: 8,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  marginTop: 20,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "500", color: "#FFFFFF" }}>Find a Tutor</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredBookings.map((booking) => (
            <View
              key={booking._id}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: "#6C3FCF",
                      backgroundColor: "#EEF2FF",
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 4,
                    }}
                  >
                    {booking.bookingRef}
                  </Text>
                </View>
                <StatusPill status={booking.status} size="small" />
              </View>

              {/* Tutor Info */}
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <AvatarInitials
                  name={booking.tutorId?.name || "Tutor"}
                  initials={booking.tutorId?.name?.charAt(0) || "T"}
                  size={48}
                />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "500", color: "#1A1A1A" }}>
                    {booking.tutorId?.name || "Tutor"}
                  </Text>
                  <Text style={{ fontSize: 14, color: "#6B7280" }}>
                    {booking.subject} • Grade {booking.gradeRange}
                  </Text>
                </View>
              </View>

              {/* Session Details */}
              <View
                style={{
                  backgroundColor: "#F9FAFB",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 12,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                  <Text style={{ fontSize: 14, color: "#1A1A1A", marginLeft: 8 }}>
                    {formatDate(booking.sessionDate)}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  <Ionicons name="time-outline" size={16} color="#6B7280" />
                  <Text style={{ fontSize: 14, color: "#1A1A1A", marginLeft: 8 }}>
                    {booking.timeSlot}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name={booking.sessionType === "Online" ? "videocam-outline" : "location-outline"}
                    size={16}
                    color="#6B7280"
                  />
                  <Text style={{ fontSize: 14, color: "#1A1A1A", marginLeft: 8 }}>
                    {booking.sessionType}
                  </Text>
                </View>
              </View>

              {/* Footer */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTopWidth: 1,
                  borderTopColor: "#F3F4F6",
                  paddingTop: 12,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "600", color: "#6C3FCF" }}>
                  Rs {booking.totalAmount}
                </Text>

                {(booking.status === "pending" || booking.status === "confirmed") && (
                  <TouchableOpacity
                    onPress={() => handleCancelBooking(booking)}
                    activeOpacity={0.8}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 6,
                      backgroundColor: "#FEF2F2",
                      borderWidth: 1,
                      borderColor: "#FECACA",
                    }}
                  >
                    <Text style={{ fontSize: 13, color: "#DC2626", fontWeight: "500" }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                )}

                {booking.status === "completed" && !booking.isReviewed && (
                  <TouchableOpacity
                    onPress={() => openReviewModal(booking)}
                    activeOpacity={0.8}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 6,
                      backgroundColor: "#EEF2FF",
                      borderWidth: 1,
                      borderColor: "#6C3FCF",
                    }}
                  >
                    <Text style={{ fontSize: 13, color: "#6C3FCF", fontWeight: "500" }}>
                      Review
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 24,
              maxHeight: "80%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "600", color: "#1A1A1A" }}>
                Write a Review
              </Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)} activeOpacity={0.8}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {reviewBooking && (
              <>
                <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 8 }}>
                  How would you rate {reviewBooking.tutorId?.name || "the tutor"}?
                </Text>

                <View style={{ alignItems: "center", marginBottom: 20 }}>
                  <StarRatingInput rating={reviewRating} onRate={setReviewRating} />
                </View>

                <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 8 }}>
                  Share your experience
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    borderRadius: 12,
                    padding: 16,
                    fontSize: 14,
                    color: "#1A1A1A",
                    minHeight: 120,
                    textAlignVertical: "top",
                    marginBottom: 8,
                  }}
                  multiline={true}
                  maxLength={500}
                  placeholder="Tell other parents about your experience..."
                  placeholderTextColor="#9CA3AF"
                  value={reviewComment}
                  onChangeText={setReviewComment}
                />
                <Text style={{ fontSize: 12, color: "#9CA3AF", textAlign: "right", marginBottom: 20 }}>
                  {reviewComment.length}/500
                </Text>

                <TouchableOpacity
                  onPress={handleSubmitReview}
                  disabled={isSubmittingReview || reviewRating === 0}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: reviewRating === 0 ? "#E5E7EB" : "#6C3FCF",
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: "center",
                  }}
                >
                  {isSubmittingReview ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "500",
                        color: reviewRating === 0 ? "#9CA3AF" : "#FFFFFF",
                      }}
                    >
                      Submit Review
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MyBookingsScreen;
