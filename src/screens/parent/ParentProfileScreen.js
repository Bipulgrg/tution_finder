import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import AvatarInitials from "../../components/AvatarInitials";

const menuItems = [
  { icon: "person-outline", label: "Edit Profile", action: () => {} },
  { icon: "notifications-outline", label: "Notifications", action: () => {} },
  { icon: "shield-checkmark-outline", label: "Privacy & Security", action: () => {} },
  { icon: "help-circle-outline", label: "Help & Support", action: () => {} },
  { icon: "information-circle-outline", label: "About", action: () => {} },
];

const ParentProfileScreen = () => {
  const { userName, logout } = useAuth();

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
            <AvatarInitials name={userName} initials={userName?.slice(0, 2).toUpperCase() || "U"} size={100} />
            <Text
              style={{
                fontSize: 24,
                fontWeight: "500",
                color: "#FFFFFF",
                marginTop: 16,
                marginBottom: 4,
              }}
            >
              {userName || "Parent"}
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
              overflow: "hidden",
            }}
          >
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                onPress={item.action}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                  borderBottomColor: "#E5E7EB",
                }}
              >
                <Ionicons name={item.icon} size={24} color="#6B7280" />
                <Text
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: "#1A1A1A",
                    marginLeft: 12,
                  }}
                >
                  {item.label}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
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
