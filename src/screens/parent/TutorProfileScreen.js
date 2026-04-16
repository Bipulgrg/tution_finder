import React, { useEffect, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  useWindowDimensions,
  Platform,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTutor } from "../../context/TutorContext";
import AvatarInitials from "../../components/AvatarInitials";
import StarRating from "../../components/StarRating";
import FilterChip from "../../components/FilterChip";
import { apiRequest } from "../../api/client";

const TutorProfileScreen = ({ route, navigation }) => {
  const tutor = route?.params?.tutor;
  const { toggleSaveTutor, isTutorSaved } = useTutor();
  const [reviews, setReviews] = useState([]);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Review form state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [hasReviewed, setHasReviewed] = useState(false);

  const isSaved = tutor?.id ? isTutorSaved(tutor.id) : false;

  if (!tutor) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F5F5F7", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: "500", color: "#111827", textAlign: "center", marginBottom: 12 }}>
          Tutor not found
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ backgroundColor: "#6C3FCF", borderRadius: 8, paddingVertical: 12, paddingHorizontal: 16 }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "500" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBookNow = () => {
    if (!tutor?.id) return;
    navigation.navigate("Booking", { tutor });
  };

  useEffect(() => {
    if (!tutor?.id) return;
    apiRequest(`/api/reviews/tutor/${tutor.id}`, { method: "GET" })
      .then((res) => setReviews(Array.isArray(res?.data) ? res.data : []))
      .catch((e) => console.error("Error loading reviews:", e));
  }, [tutor?.id]);

  useEffect(() => {
    if (!tutor?.id) return;
    apiRequest(`/api/tutors/${tutor.id}`, { method: "GET" })
      .then((res) => {
        setContactEmail(res?.data?.user?.email || "");
        setContactPhone(res?.data?.user?.phone || "");
      })
      .catch((e) => console.error("Error loading tutor contact:", e));
  }, [tutor?.id]);

  // Fetch completed bookings to check if user can review
  useEffect(() => {
    if (!tutor?.id) return;
    apiRequest(`/api/bookings?status=completed`, { method: "GET" })
      .then((res) => {
        const bookings = res?.data?.items || [];
        const tutorBookings = bookings.filter(b => b.tutorId === tutor.id || b.tutorId?._id === tutor.id);
        setCompletedBookings(tutorBookings);
        // Check if already reviewed any of these bookings
        const reviewed = reviews.some(r =>
          tutorBookings.some(b => String(b._id) === String(r.bookingId))
        );
        setHasReviewed(reviewed);
      })
      .catch((e) => console.error("Error loading bookings:", e));
  }, [tutor?.id, reviews]);

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      Alert.alert("Rating Required", "Please select a star rating");
      return;
    }
    if (!reviewComment.trim()) {
      Alert.alert("Comment Required", "Please write a review comment");
      return;
    }
    if (completedBookings.length === 0) {
      Alert.alert("Cannot Review", "You need to complete a session with this tutor before reviewing");
      return;
    }

    const bookingToReview = completedBookings.find(b =>
      !reviews.some(r => String(r.bookingId) === String(b._id))
    );

    if (!bookingToReview) {
      Alert.alert("Already Reviewed", "You have already reviewed this tutor");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await apiRequest("/api/reviews", {
        method: "POST",
        body: {
          bookingId: bookingToReview._id,
          rating: reviewRating,
          comment: reviewComment.trim(),
        },
      });

      if (res?.data?.review) {
        setReviews([res.data.review, ...reviews]);
        setHasReviewed(true);
        setShowReviewModal(false);
        setReviewRating(0);
        setReviewComment("");
        Alert.alert("Success", "Your review has been submitted!");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", error?.message || "Failed to submit review. Please try again.");
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

  const handleMessageTutor = async () => {
    if (isStartingChat) return;

    setIsStartingChat(true);
    try {
      const res = await apiRequest("/api/messages/conversations", {
        method: "POST",
        body: { otherUserId: tutor?.id },
      });

      const conversation = res?.data?.conversation;
      if (!conversation?._id) {
        throw new Error("Conversation could not be created");
      }

      navigation.navigate("Chat", {
        chat: {
          id: conversation._id,
          conversationId: conversation._id,
          name: tutor.name,
          initials: tutor.initials,
        },
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
      Alert.alert("Unable to open chat", error?.message || "Please try again in a moment.");
    } finally {
      setIsStartingChat(false);
    }
  };

  const { height: windowHeight } = useWindowDimensions();

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F7", position: "relative", height: windowHeight }}>
      <ScrollView
        style={{ flex: 1, overflow: 'scroll' }}
        contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled">
        <View
          style={{
            backgroundColor: "#6C3FCF",
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 30,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <AvatarInitials name={tutor.name} initials={tutor.initials} size={80} />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "500",
                  color: "#FFFFFF",
                  marginBottom: 4,
                }}
              >
                {tutor.name}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.8)",
                  marginBottom: 4,
                }}
              >
                {tutor.education?.degree || ""} · {tutor.education?.university || ""}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <StarRating rating={tutor.rating} size={16} />
                <Text
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.9)",
                    marginLeft: 8,
                  }}
                >
                  {tutor.rating} ({tutor.reviewCount} reviews)
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            marginHorizontal: 16,
            marginTop: -20,
            padding: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "500",
                  color: "#6C3FCF",
                }}
              >
                Rs {tutor.ratePerHour}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "#6B7280",
                }}
              >
                per hour
              </Text>
            </View>
            <View
              style={{
                width: 1,
                backgroundColor: "#E5E7EB",
              }}
            />
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "500",
                  color: "#1A1A1A",
                }}
              >
                {tutor.experience} yrs
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "#6B7280",
                }}
              >
                experience
              </Text>
            </View>
            <View
              style={{
                width: 1,
                backgroundColor: "#E5E7EB",
              }}
            />
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "500",
                  color: "#1A1A1A",
                }}
              >
                {tutor.studentCount}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "#6B7280",
                }}
              >
                students
              </Text>
            </View>
          </View>
        </View>

        <View style={{ padding: 16 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: "#1A1A1A",
              marginBottom: 12,
            }}
          >
            Subjects & Grades
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }}>
            {(tutor.subjects || []).map((subject) => (
              <FilterChip
                key={subject}
                label={subject}
                selected={true}
                onPress={() => {}}
                size="small"
              />
            ))}
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: "#F3F4F6",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: "#6B7280",
                }}
              >
                Grade {tutor.gradeRange}
              </Text>
            </View>
          </View>

          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: "#1A1A1A",
              marginBottom: 12,
            }}
          >
            Location
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons name="location-outline" size={20} color="#6B7280" />
            <Text
              style={{
                fontSize: 14,
                color: "#1A1A1A",
                marginLeft: 8,
              }}
            >
              {tutor.area}
            </Text>
          </View>
          {tutor.isOnline && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Ionicons name="videocam-outline" size={20} color="#6C3FCF" />
              <Text
                style={{
                  fontSize: 14,
                  color: "#6C3FCF",
                  marginLeft: 8,
                }}
              >
                Also teaches online
              </Text>
            </View>
          )}

          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: "#1A1A1A",
              marginBottom: 12,
            }}
          >
            Availability
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }}>
            {(tutor.availability || []).map((avail) => (
              <View
                key={avail}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor: "#EEF2FF",
                  borderWidth: 1,
                  borderColor: "#6C3FCF",
                  marginRight: 8,
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "500",
                    color: "#6C3FCF",
                  }}
                >
                  {avail}
                </Text>
              </View>
            ))}
          </View>

          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: "#1A1A1A",
              marginBottom: 8,
            }}
          >
            About
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              lineHeight: 22,
              marginBottom: 20,
            }}
          >
            {tutor.bio}
          </Text>

          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: "#1A1A1A",
              marginBottom: 12,
            }}
          >
            Contact
          </Text>

          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              marginBottom: 20,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <Ionicons name="mail-outline" size={20} color="#6B7280" />
              <Text
                style={{
                  fontSize: 14,
                  color: "#1A1A1A",
                  marginLeft: 10,
                  flex: 1,
                }}
              >
                {contactEmail ? contactEmail : "Email not available"}
              </Text>
              {contactEmail ? (
                <TouchableOpacity
                  onPress={() => Linking.openURL(`mailto:${contactEmail}`)}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: "#EEF2FF",
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                  }}
                >
                  <Text style={{ fontSize: 13, color: "#6C3FCF", fontWeight: "500" }}>Email</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="call-outline" size={20} color="#6B7280" />
              <Text style={{ fontSize: 14, color: "#1A1A1A", marginLeft: 10 }}>
                {contactPhone ? contactPhone : "Phone not available yet"}
              </Text>
              {contactPhone ? (
                <TouchableOpacity
                  onPress={() => Linking.openURL(`tel:${contactPhone}`)}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: "#EEF2FF",
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    marginLeft: 10,
                  }}
                >
                  <Text style={{ fontSize: 13, color: "#6C3FCF", fontWeight: "500" }}>Call</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: "#1A1A1A",
              }}
            >
              Reviews
            </Text>
            {completedBookings.length > 0 && !hasReviewed && (
              <TouchableOpacity
                onPress={() => setShowReviewModal(true)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: "#EEF2FF",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderWidth: 1,
                  borderColor: "#6C3FCF",
                }}
              >
                <Text style={{ fontSize: 13, color: "#6C3FCF", fontWeight: "500" }}>Write a Review</Text>
              </TouchableOpacity>
            )}
          </View>
          {reviews.length === 0 && (
            <View style={{ backgroundColor: "#FFFFFF", borderRadius: 12, padding: 20, marginBottom: 12, alignItems: "center" }}>
              <Ionicons name="chatbubble-outline" size={32} color="#9CA3AF" style={{ marginBottom: 8 }} />
              <Text style={{ fontSize: 14, color: "#6B7280", textAlign: "center" }}>
                No reviews yet. Be the first to review!
              </Text>
            </View>
          )}
          {reviews.map((review) => (
            <View
              key={review._id}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: "#1A1A1A",
                  }}
                >
                  {review?.parentId?.name || "Parent"}
                </Text>
                <StarRating rating={review.rating || 0} size={12} />
              </View>
              <Text
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                  lineHeight: 20,
                }}
              >
                {review.comment || ""}
              </Text>
            </View>
          ))}
        </View>
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
              <TouchableOpacity
                onPress={() => setShowReviewModal(false)}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 8 }}>
              How would you rate {tutor.name}?
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
                marginBottom: 20,
              }}
              multiline={true}
              maxLength={500}
              placeholder="Tell other parents about your experience with this tutor..."
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
          </View>
        </View>
      </Modal>

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          elevation: 10,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          paddingHorizontal: 16,
          paddingVertical: 12,
          paddingBottom: 24,
          flexDirection: "row",
        }}
      >
        <TouchableOpacity
          onPress={() => tutor?.id && toggleSaveTutor(tutor.id)}
          activeOpacity={0.8}
          style={{
            width: 56,
            height: 56,
            borderRadius: 8,
            backgroundColor: isSaved ? "#6C3FCF" : "#F3F4F6",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
            borderWidth: 1,
            borderColor: isSaved ? "#6C3FCF" : "#E5E7EB",
          }}
        >
          <Ionicons
            name={isSaved ? "heart" : "heart-outline"}
            size={28}
            color={isSaved ? "#FFFFFF" : "#6B7280"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleMessageTutor}
          activeOpacity={0.8}
          disabled={isStartingChat}
          style={{
            width: 56,
            height: 56,
            borderRadius: 8,
            backgroundColor: "#FFFFFF",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
            borderWidth: 1,
            borderColor: "#E5E7EB",
          }}
        >
          {isStartingChat ? (
            <ActivityIndicator size="small" color="#6C3FCF" />
          ) : (
            <Ionicons name="chatbubble-outline" size={24} color="#6C3FCF" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleBookNow}
          activeOpacity={0.8}
          style={{
            flex: 1,
            backgroundColor: "#6C3FCF",
            borderRadius: 8,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: "#FFFFFF",
            }}
          >
            Book Now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TutorProfileScreen;
