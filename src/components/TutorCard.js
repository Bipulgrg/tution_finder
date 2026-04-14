import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AvatarInitials from "./AvatarInitials";
import StarRating from "./StarRating";
import StatusPill from "./StatusPill";

const TutorCard = ({ tutor, onPress, onSave, isSaved }) => {
  return (
    <TouchableOpacity
      onPress={() => onPress && onPress(tutor)}
      activeOpacity={0.8}
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: "row" }}>
        <AvatarInitials name={tutor.name} initials={tutor.initials} size={56} />
        
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: "#1A1A1A",
                  marginBottom: 4,
                }}
              >
                {tutor.name}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                  marginBottom: 6,
                }}
              >
                {tutor.subjects.slice(0, 2).join(", ")}
                {tutor.subjects.length > 2 && "..."}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <StarRating rating={tutor.rating} size={14} />
                <Text
                  style={{
                    fontSize: 12,
                    color: "#6B7280",
                    marginLeft: 6,
                  }}
                >
                  ({tutor.reviewCount})
                </Text>
              </View>
            </View>
            
            <TouchableOpacity
              onPress={() => onSave && onSave(tutor)}
              activeOpacity={0.7}
              style={{ padding: 4 }}
            >
              <Ionicons
                name={isSaved ? "heart" : "heart-outline"}
                size={24}
                color={isSaved ? "#6C3FCF" : "#9CA3AF"}
              />
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 4,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <StatusPill
                status={tutor.availability.includes("Weekday evenings") ? "Available" : "Busy"}
                size="small"
              />
              <View
                style={{
                  marginLeft: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 20,
                  backgroundColor: "#F3F4F6",
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "500",
                    color: "#6B7280",
                  }}
                >
                  {tutor.area}
                </Text>
              </View>
              {tutor.isOnline && (
                <View
                  style={{
                    marginLeft: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 20,
                    backgroundColor: "#EEF2FF",
                    borderWidth: 1,
                    borderColor: "#6C3FCF",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "500",
                      color: "#6C3FCF",
                    }}
                  >
                    Online
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: "#6C3FCF",
              }}
            >
              Rs {tutor.ratePerHour}/hr
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TutorCard;
