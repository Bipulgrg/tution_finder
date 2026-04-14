import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTutor } from "../../context/TutorContext";
import AvatarInitials from "../../components/AvatarInitials";
import StarRating from "../../components/StarRating";
import FilterChip from "../../components/FilterChip";
import { apiRequest } from "../../api/client";

const TutorProfileScreen = ({ route, navigation }) => {
  const { tutor } = route.params;
  const { toggleSaveTutor, isTutorSaved } = useTutor();
  const [reviews, setReviews] = useState([]);

  const isSaved = isTutorSaved(tutor.id);

  const handleBookNow = () => {
    navigation.navigate("Booking", { tutor });
  };

  useEffect(() => {
    apiRequest(`/api/reviews/tutor/${tutor.id}`, { method: "GET" })
      .then((res) => setReviews(Array.isArray(res?.data) ? res.data : []))
      .catch((e) => console.error("Error loading reviews:", e));
  }, [tutor.id]);

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F7" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
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
                {tutor.education.degree} · {tutor.education.university}
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
            {tutor.subjects.map((subject) => (
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
            {tutor.availability.map((avail) => (
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
            Reviews
          </Text>
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

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
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
          onPress={() => toggleSaveTutor(tutor.id)}
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
