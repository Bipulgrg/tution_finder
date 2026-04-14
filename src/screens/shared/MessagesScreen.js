import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AvatarInitials from "../../components/AvatarInitials";
import { mockChats } from "../../data/mockTutors";

const MessagesScreen = ({ navigation }) => {
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
          Messages
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {mockChats.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            onPress={() => navigation.navigate("Chat", { chat })}
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
            <AvatarInitials name={chat.name} initials={chat.initials} size={50} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "500",
                    color: "#1A1A1A",
                  }}
                >
                  {chat.name}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: "#9CA3AF",
                  }}
                >
                  {chat.timestamp}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: "#6B7280",
                    flex: 1,
                    marginRight: 8,
                  }}
                  numberOfLines={1}
                >
                  {chat.lastMessage}
                </Text>
                {chat.unread > 0 && (
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: "#6C3FCF",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        color: "#FFFFFF",
                      }}
                    >
                      {chat.unread}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 40,
          }}
        >
          <Ionicons name="chatbubbles-outline" size={48} color="#9CA3AF" />
          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              marginTop: 12,
            }}
          >
            More conversations will appear here
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MessagesScreen;
