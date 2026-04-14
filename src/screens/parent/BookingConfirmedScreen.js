import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BookingConfirmedScreen = ({ route, navigation }) => {
  const { booking } = route.params;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F7" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{ alignItems: "center", marginTop: 20, marginBottom: 30 }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: "#EAF3DE",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Ionicons name="checkmark" size={60} color="#3B6D11" />
          </View>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "500",
              color: "#1A1A1A",
              marginBottom: 8,
            }}
          >
            Session booked!
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              textAlign: "center",
            }}
          >
            Your booking has been confirmed.\nThe tutor will contact you shortly.
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "500",
              color: "#1A1A1A",
              marginBottom: 20,
            }}
          >
            Booking Details
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>Booking ID</Text>
            <Text style={styles.value}>{booking.id}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Tutor</Text>
            <Text style={styles.value}>{booking.tutorName}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Subject</Text>
            <Text style={styles.value}>{booking.subject}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{formatDate(booking.date)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Time</Text>
            <Text style={styles.value}>{booking.time}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>{booking.location}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Session Type</Text>
            <Text style={styles.value}>{booking.sessionType}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Sessions</Text>
            <Text style={styles.value}>{booking.sessions}</Text>
          </View>

          <View style={{ height: 1, backgroundColor: "#E5E7EB", marginVertical: 16 }} />

          <View style={styles.row}>
            <Text style={[styles.label, { fontWeight: "500" }]}>Total Amount</Text>
            <Text style={[styles.value, { color: "#6C3FCF", fontWeight: "500" }]}>
              Rs {booking.amount}
            </Text>
          </View>
        </View>

        <Text
          style={{
            fontSize: 12,
            color: "#9CA3AF",
            textAlign: "center",
            fontStyle: "italic",
            marginBottom: 20,
          }}
        >
          Note: Date shown is Gregorian calendar. Nepali calendar date can be found in your booking confirmation email.
        </Text>

        <TouchableOpacity
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 8,
            paddingVertical: 16,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#6C3FCF",
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: "#6C3FCF",
            }}
          >
            Add to Calendar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("ParentTabs", { screen: "Home" })}
          style={{
            backgroundColor: "#6C3FCF",
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
            Back to Home
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
  },
  value: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "500",
  },
};

export default BookingConfirmedScreen;
