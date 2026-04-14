import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBooking } from "../../context/BookingContext";
import AvatarInitials from "../../components/AvatarInitials";
import StatusPill from "../../components/StatusPill";
import FilterChip from "../../components/FilterChip";

const ScheduleScreen = () => {
  const { confirmedBookings, tutorConfirmBooking, refreshBookings } = useBooking();
  const [filter, setFilter] = useState("All");

  const filters = ["All", "Confirmed", "Pending"];

  const filteredBookings = confirmedBookings.filter((booking) => {
    if (filter === "All") return true;
    return booking.status === filter;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
    };
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F7" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <Text
          style={{
            flex: 1,
            fontSize: 20,
            fontWeight: "500",
            color: "#1A1A1A",
          }}
        >
          Schedule
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "#FFFFFF",
        }}
      >
        {filters.map((f) => (
          <FilterChip
            key={f}
            label={f}
            selected={filter === f}
            onPress={() => setFilter(f)}
            size="small"
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => {
            const date = formatDate(booking.date);
            const canConfirm = booking.status === "Pending";
            return (
              <View
                key={booking.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 12,
                  marginBottom: 12,
                  flexDirection: "row",
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    backgroundColor: "#6C3FCF",
                    paddingHorizontal: 16,
                    paddingVertical: 20,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
                    {date.month}
                  </Text>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "500",
                      color: "#FFFFFF",
                    }}
                  >
                    {date.day}
                  </Text>
                  <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
                    {date.weekday}
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    padding: 16,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <AvatarInitials
                    name={booking.tutorName}
                    initials={booking.tutorInitials}
                    size={40}
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
                        marginBottom: 4,
                      }}
                    >
                      {booking.time} · {booking.location}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <StatusPill status={booking.status} size="small" />
                      {canConfirm && (
                        <TouchableOpacity
                          onPress={async () => {
                            try {
                              await tutorConfirmBooking(booking.id);
                              await refreshBookings();
                            } catch (e) {
                              console.error("Failed to confirm booking:", e);
                            }
                          }}
                          style={{
                            backgroundColor: "#6C3FCF",
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 8,
                          }}
                        >
                          <Text style={{ color: "#FFFFFF", fontWeight: "500", fontSize: 12 }}>Confirm</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 60,
            }}
          >
            <Ionicons name="calendar-outline" size={60} color="#9CA3AF" />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: "#1A1A1A",
                marginTop: 16,
                marginBottom: 8,
              }}
            >
              No bookings found
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
                textAlign: "center",
              }}
            >
              Your confirmed bookings will appear here
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ScheduleScreen;
