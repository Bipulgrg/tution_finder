import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AvatarInitials from "../../components/AvatarInitials";
import { apiRequest } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

const ChatScreen = ({ route }) => {
  const { chat } = route.params;
  const { isLoggedIn, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  const conversationId = chat?.conversationId || chat?.id;

  useEffect(() => {
    if (!isLoggedIn || !conversationId) return;
    apiRequest(`/api/messages/conversations/${conversationId}`, { method: "GET" })
      .then((res) => setMessages(Array.isArray(res?.data) ? res.data : []))
      .catch((e) => console.error("Error loading messages:", e));
  }, [isLoggedIn, conversationId]);

  const uiMessages = useMemo(() => {
    const me = user?._id;
    return messages.map((m) => ({
      id: m._id,
      text: m.content,
      sender: m.senderId?.toString?.() === me?.toString?.() ? "user" : "other",
      timestamp: m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : "",
    }));
  }, [messages, user?._id]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const content = inputText.trim();
    setInputText("");

    if (!isLoggedIn || !conversationId) return;
    try {
      const res = await apiRequest(`/api/messages/conversations/${conversationId}/messages`, {
        method: "POST",
        body: { content },
      });
      const msg = res?.data?.message;
      if (msg) setMessages((prev) => [...prev, msg]);
    } catch (e) {
      console.error("Error sending message:", e);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F7" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {uiMessages.map((message) => (
            <View
              key={message.id}
              style={{
                flexDirection: "row",
                justifyContent: message.sender === "user" ? "flex-end" : "flex-start",
                marginBottom: 16,
              }}
            >
              {message.sender === "other" && (
                <AvatarInitials name={chat.name} initials={chat.initials} size={36} />
              )}
              <View
                style={{
                  maxWidth: "75%",
                  marginLeft: message.sender === "other" ? 8 : 0,
                  marginRight: message.sender === "user" ? 0 : 8,
                }}
              >
                <View
                  style={{
                    backgroundColor: message.sender === "user" ? "#6C3FCF" : "#FFFFFF",
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderBottomLeftRadius: message.sender === "other" ? 4 : 16,
                    borderBottomRightRadius: message.sender === "user" ? 4 : 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: message.sender === "user" ? "#FFFFFF" : "#1A1A1A",
                      lineHeight: 20,
                    }}
                  >
                    {message.text}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 11,
                    color: "#9CA3AF",
                    marginTop: 4,
                    alignSelf: message.sender === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  {message.timestamp}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#E5E7EB",
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            style={{
              flex: 1,
              backgroundColor: "#F5F5F7",
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 10,
              fontSize: 16,
              color: "#1A1A1A",
              maxHeight: 100,
            }}
            multiline
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: inputText.trim() ? "#6C3FCF" : "#E5E7EB",
              justifyContent: "center",
              alignItems: "center",
              marginLeft: 10,
            }}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? "#FFFFFF" : "#9CA3AF"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
