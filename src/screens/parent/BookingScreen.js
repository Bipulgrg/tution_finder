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

const timeSlots = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "2:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
];

const BookingScreen = ({ route, navigation }) => {
  const { tutor } = route.params;
  const { confirmBooking } = useBooking();

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [sessionType, setSessionType] = useState("In-person");
  const [sessions, setSessions] = useState(1);

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const currentDay = today.getDate();

  const generateCalendar = () => {
    const days = [];
    for (let i = currentDay; i <= Math.min(currentDay + 14, daysInMonth); i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), i);
      days.push({
        day: i,
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        fullDate: date.toISOString().split("T")[0],
      });
    }
    return days;
  };

  const calendarDays = generateCalendar();

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) return;

    const bookingDetails = {
      tutorId: tutor.id,
      tutorName: tutor.name,
      tutorInitials: tutor.initials,
      subject: tutor.subjects[0],
      date: selectedDate,
      time: selectedTime,
      location: sessionType === "Online" ? "Online" : tutor.area,
      amount: tutor.ratePerHour * sessions,
      sessionType,
      sessions,
    };

    confirmBooking(bookingDetails);
    navigation.navigate("BookingConfirmed", { booking: bookingDetails });
  };

  const canConfirm = selectedDate && selectedTime;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F7" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <AvatarInitials name={tutor.name} initials={tutor.initials} size={48} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: "#1A1A1A",
              }}
            >
              {tutor.name}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
              }}
            >
              {tutor.subjects[0]} · Rs {tutor.ratePerHour}/hr
            </Text>
          </View>
        </View>

        <Text
          style={{
            fontSize: 18,
            fontWeight: "500",
            color: "#1A1A1A",
            marginBottom: 16,
          }}
        >
          Select Date
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ marginBottom: 24 }}
        >
          {calendarDays.map((item) => (
            <TouchableOpacity
              key={item.day}
              onPress={() => setSelectedDate(item.fullDate)}
              activeOpacity={0.8}
              style={{
                width: 60,
                height: 70,
                borderRadius: 12,
                backgroundColor: selectedDate === item.fullDate ? "#6C3FCF" : "#FFFFFF",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 10,
                borderWidth: 1,
                borderColor: selectedDate === item.fullDate ? "#6C3FCF" : "#E5E7EB",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: selectedDate === item.fullDate ? "#FFFFFF" : "#6B7280",
                  marginBottom: 4,
                }}
              >
                {item.dayName}
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "500",
                  color: selectedDate === item.fullDate ? "#FFFFFF" : "#1A1A1A",
                }}
              >
                {item.day}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text
          style={{
            fontSize: 18,
            fontWeight: "500",
            color: "#1A1A1A",
            marginBottom: 16,
          }}
        >
          Select Time
        </Text>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          {timeSlots.map((time) => (
            <TouchableOpacity
              key={time}
              onPress={() => setSelectedTime(time)}
              activeOpacity={0.8}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: selectedTime === time ? "#6C3FCF" : "#FFFFFF",
                borderWidth: 1,
                borderColor: selectedTime === time ? "#6C3FCF" : "#E5E7EB",
                marginRight: 10,
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: selectedTime === time ? "#FFFFFF" : "#1A1A1A",
                }}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text
          style={{
            fontSize: 18,
            fontWeight: "500",
            color: "#1A1A1A",
            marginBottom: 16,
          }}
        >
          Session Type
        </Text>

        <View
          style={{
            flexDirection: "row",
            marginBottom: 24,
          }}
        >
          <TouchableOpacity
            onPress={() => setSessionType("In-person")}
            activeOpacity={0.8}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 14,
              borderRadius: 8,
              backgroundColor: sessionType === "In-person" ? "#6C3FCF" : "#FFFFFF",
              borderWidth: 1,
              borderColor: sessionType === "In-person" ? "#6C3FCF" : "#E5E7EB",
              marginRight: 8,
            }}
          >
            <Ionicons
              name="location"
              size={18}
              color={sessionType === "In-person" ? "#FFFFFF" : "#6B7280"}
            />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: sessionType === "In-person" ? "#FFFFFF" : "#1A1A1A",
                marginLeft: 8,
              }}
            >
              In-person
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSessionType("Online")}
            activeOpacity={0.8}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 14,
              borderRadius: 8,
              backgroundColor: sessionType === "Online" ? "#6C3FCF" : "#FFFFFF",
              borderWidth: 1,
              borderColor: sessionType === "Online" ? "#6C3FCF" : "#E5E7EB",
              marginLeft: 8,
            }}
          >
            <Ionicons
              name="videocam"
              size={18}
              color={sessionType === "Online" ? "#FFFFFF" : "#6B7280"}
            />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: sessionType === "Online" ? "#FFFFFF" : "#1A1A1A",
                marginLeft: 8,
              }}
            >
              Online
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={{
            fontSize: 18,
            fontWeight: "500",
            color: "#1A1A1A",
            marginBottom: 16,
          }}
        >
          Number of Sessions
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <TouchableOpacity
            onPress={() => setSessions(Math.max(1, sessions - 1))}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#F3F4F6",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="remove" size={24} color="#1A1A1A" />
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 24,
              fontWeight: "500",
              color: "#1A1A1A",
              marginHorizontal: 24,
            }}
          >
            {sessions}
          </Text>

          <TouchableOpacity
            onPress={() => setSessions(sessions + 1)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#6C3FCF",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: "#1A1A1A",
              marginBottom: 16,
            }}
          >
            Booking Summary
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 14, color: "#6B7280" }}>
              Rate per session
            </Text>
            <Text style={{ fontSize: 14, color: "#1A1A1A" }}>
              Rs {tutor.ratePerHour}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 14, color: "#6B7280" }}>Sessions</Text>
            <Text style={{ fontSize: 14, color: "#1A1A1A" }}>× {sessions}</Text>
          </View>

          <View
            style={{
              height: 1,
              backgroundColor: "#E5E7EB",
              marginVertical: 12,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: "#1A1A1A",
              }}
            >
              Total Amount
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "500",
                color: "#6C3FCF",
              }}
            >
              Rs {tutor.ratePerHour * sessions}
            </Text>
          </View>
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
        }}
      >
        <TouchableOpacity
          onPress={handleConfirm}
          disabled={!canConfirm}
          activeOpacity={0.8}
          style={{
            backgroundColor: canConfirm ? "#6C3FCF" : "#C4B5E0",
            borderRadius: 8,
            paddingVertical: 16,
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
            Confirm Booking
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default BookingScreen;
