import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useBooking } from "../../context/BookingContext";
import AvatarInitials from "../../components/AvatarInitials";
import StatusPill from "../../components/StatusPill";
import SectionHeader from "../../components/SectionHeader";
import { apiRequest } from "../../api/client";

const TutorDashboardScreen = ({ navigation }) => {
  const { userName } = useAuth();
  const { confirmedBookings } = useBooking();
  const [isOnline, setIsOnline] = useState(true);

  const onToggleOnline = async (next) => {
    setIsOnline(next);
    try {
      await apiRequest("/api/tutors/profile/status", { method: "PUT", body: { isOnline: next } });
    } catch (e) {
      console.error("Failed to update online status:", e);
    }
  };

  const thisWeekEarnings = confirmedBookings
    .filter((b) => b.status === "Confirmed")
    .reduce((sum, b) => sum + b.amount, 0);

  const thisWeekSessions = confirmedBookings.filter(
    (b) => b.status === "Confirmed"
  ).length;

  const allBookings = [...confirmedBookings].slice(0, 5);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F7" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 20 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
              }}
            >
              Tutor Dashboard
            </Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "500",
                color: "#1A1A1A",
              }}
            >
              {userName || "Tutor"}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#FFFFFF",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: isOnline ? "#3B6D11" : "#6B7280",
                marginRight: 8,
              }}
            >
              {isOnline ? "Online" : "Offline"}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={onToggleOnline}
              trackColor={{ false: "#E5E7EB", true: "#EAF3DE" }}
              thumbColor={isOnline ? "#3B6D11" : "#9CA3AF"}
            />
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            marginBottom: 24,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              padding: 20,
              marginRight: 8,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: "#6B7280",
                marginBottom: 8,
              }}
            >
              This Week Earnings
            </Text>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "500",
                color: "#6C3FCF",
              }}
            >
              Rs {thisWeekEarnings}
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              padding: 20,
              marginLeft: 8,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: "#6B7280",
                marginBottom: 8,
              }}
            >
              Sessions Count
            </Text>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "500",
                color: "#1A1A1A",
              }}
            >
              {thisWeekSessions}
            </Text>
          </View>
        </View>

        <SectionHeader
          title="Upcoming Bookings"
          showSeeAll={allBookings.length > 0}
          onSeeAll={() => navigation.navigate("Schedule")}
        />

        {allBookings.length > 0 ? (
          allBookings.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              activeOpacity={0.8}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <AvatarInitials
                name={booking.tutorName || booking.studentName || "Student"}
                initials={booking.tutorInitials || "ST"}
                size={48}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "500",
                    color: "#1A1A1A",
                    marginBottom: 4,
                  }}
                >
                  {booking.subject}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#6B7280",
                  }}
                >
                  {booking.date} · {booking.time}
                </Text>
              </View>
              <StatusPill status={booking.status} size="small" />
            </TouchableOpacity>
          ))
        ) : (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              padding: 30,
              alignItems: "center",
            }}
          >
            <Ionicons name="calendar-outline" size={40} color="#9CA3AF" />
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
                marginTop: 8,
              }}
            >
              No upcoming bookings
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
          style={{
            backgroundColor: "#6C3FCF",
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: "#FFFFFF",
            }}
          >
            Complete Your Profile
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TutorDashboardScreen;
