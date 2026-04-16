import React, { useEffect, useState } from "react";
import {
  Alert,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  TextInput,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import AvatarInitials from "../../components/AvatarInitials";
import { apiRequest } from "../../api/client";

const ParentProfileScreen = () => {
  const { user, userName, logout, updateCurrentUser } = useAuth();
  const [name, setName] = useState(userName || "");
  const [isSaving, setIsSaving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privateMode, setPrivateMode] = useState(false);

  useEffect(() => {
    setName(userName || "");
  }, [userName]);

  const handleSaveProfile = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Name required", "Please enter your full name before saving.");
      return;
    }

    if (trimmedName === userName) {
      Alert.alert("No changes", "Your profile is already up to date.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await apiRequest("/api/users/me", {
        method: "PUT",
        body: { name: trimmedName },
      });
      const nextUser = res?.data?.user;
      if (nextUser) {
        await updateCurrentUser(nextUser);
      }
      Alert.alert("Profile updated", "Your account details were saved successfully.");
    } catch (error) {
      console.error("Failed to update profile:", error);
      Alert.alert("Update failed", error?.message || "Unable to save your profile right now.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F7" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View
          style={{
            backgroundColor: "#6C3FCF",
            paddingHorizontal: 20,
            paddingVertical: 30,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <AvatarInitials name={name || userName} initials={(name || userName)?.slice(0, 2).toUpperCase() || "U"} size={100} />
            <Text
              style={{
                fontSize: 24,
                fontWeight: "500",
                color: "#FFFFFF",
                marginTop: 16,
                marginBottom: 4,
              }}
            >
              {name || userName || "Parent"}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.8)",
              }}
            >
              Parent Account
            </Text>
          </View>
        </View>

        <View style={{ padding: 16 }}>
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              marginBottom: 16,
              padding: 16,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "500",
                color: "#1A1A1A",
                marginBottom: 16,
              }}
            >
              Account Details
            </Text>

            <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 8 }}>
              Full Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              style={{
                backgroundColor: "#F9FAFB",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 16,
                color: "#111827",
                marginBottom: 16,
              }}
            />

            <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 8 }}>
              Email Address
            </Text>
            <View
              style={{
                backgroundColor: "#F9FAFB",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 12,
                marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 16, color: "#6B7280", flex: 1 }}>
                  {user?.email || "No email available"}
                </Text>
                {user?.email ? (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`mailto:${user.email}`)}
                    activeOpacity={0.8}
                    style={{
                      backgroundColor: "#EEF2FF",
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      marginLeft: 10,
                    }}
                  >
                    <Text style={{ fontSize: 13, color: "#6C3FCF", fontWeight: "500" }}>Email</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 8 }}>
              Phone Number
            </Text>
            <View
              style={{
                backgroundColor: "#F9FAFB",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 12,
                marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 16, color: "#6B7280", flex: 1 }}>
                  {user?.phone || user?.phoneNumber || "Phone not available yet"}
                </Text>
                {user?.phone ? (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`tel:${user.phone}`)}
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

            <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 8 }}>
              Account Type
            </Text>
            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: "#EEF2FF",
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginBottom: 16,
              }}
            >
              <Text style={{ color: "#6C3FCF", fontWeight: "500" }}>Parent</Text>
            </View>

            <TouchableOpacity
              onPress={handleSaveProfile}
              disabled={isSaving}
              style={{
                backgroundColor: isSaving ? "#C4B5E0" : "#6C3FCF",
                borderRadius: 10,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "500", color: "#FFFFFF" }}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              marginBottom: 16,
              paddingHorizontal: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#E5E7EB",
              }}
            >
              <View style={{ flex: 1, paddingRight: 16 }}>
                <Text style={{ fontSize: 16, color: "#111827", fontWeight: "500" }}>
                  Notifications
                </Text>
                <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
                  Get alerts for bookings and new messages.
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#E5E7EB", true: "#D9CCF7" }}
                thumbColor={notificationsEnabled ? "#6C3FCF" : "#9CA3AF"}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 16,
              }}
            >
              <View style={{ flex: 1, paddingRight: 16 }}>
                <Text style={{ fontSize: 16, color: "#111827", fontWeight: "500" }}>
                  Private Mode
                </Text>
                <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
                  Limit profile details shown across the app.
                </Text>
              </View>
              <Switch
                value={privateMode}
                onValueChange={setPrivateMode}
                trackColor={{ false: "#E5E7EB", true: "#D9CCF7" }}
                thumbColor={privateMode ? "#6C3FCF" : "#9CA3AF"}
              />
            </View>
          </View>

          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              marginBottom: 16,
              padding: 16,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 14 }}>
              <Ionicons name="help-circle-outline" size={22} color="#6C3FCF" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: "500", color: "#111827" }}>
                  Help & Support
                </Text>
                <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 4, lineHeight: 20 }}>
                  Use the Messages tab to contact tutors directly and manage your bookings from the app.
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <Ionicons name="information-circle-outline" size={22} color="#6C3FCF" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: "500", color: "#111827" }}>
                  About Tuition Finder
                </Text>
                <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 4, lineHeight: 20 }}>
                  Find verified tutors, book sessions, and stay in touch from one place.
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={logout}
            style={{
              backgroundColor: "#FEE2E2",
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: "#EF4444",
                marginLeft: 8,
              }}
            >
              Log Out
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 12,
              color: "#9CA3AF",
              textAlign: "center",
              marginTop: 24,
            }}
          >
            Tuition Finder v1.0.0\nServing Kathmandu, Lalitpur, Bhaktapur, Pokhara
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ParentProfileScreen;
