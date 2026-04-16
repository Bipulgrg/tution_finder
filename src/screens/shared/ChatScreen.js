import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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

const ChatScreen = ({ route, navigation }) => {
  const chat = route?.params?.chat || {};
  const { isLoggedIn, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const conversationId = chat?.conversationId || chat?.id;

  useLayoutEffect(() => {
    if (chat?.name) {
      navigation.setOptions({ title: chat.name });
    }
  }, [chat?.name, navigation]);

  useEffect(() => {
    if (!isLoggedIn || !conversationId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    apiRequest(`/api/messages/conversations/${conversationId}`, { method: "GET" })
      .then((res) => setMessages(Array.isArray(res?.data) ? res.data : []))
      .catch((e) => console.error("Error loading messages:", e))
      .finally(() => setIsLoading(false));
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
    if (!inputText.trim() || isSending) return;

    const content = inputText.trim();
    setInputText("");

    if (!isLoggedIn || !conversationId) return;
    setIsSending(true);
    try {
      const res = await apiRequest(`/api/messages/conversations/${conversationId}/messages`, {
        method: "POST",
        body: { content },
      });
      const msg = res?.data?.message;
      if (msg) setMessages((prev) => [...prev, msg]);
    } catch (e) {
      console.error("Error sending message:", e);
      setInputText(content);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F7" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {isLoading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="large" color="#6C3FCF" />
            <Text style={{ marginTop: 12, color: "#6B7280" }}>Loading conversation...</Text>
          </View>
        ) : (
          <>
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
          {uiMessages.length === 0 && (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 }}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color="#9CA3AF" />
              <Text style={{ fontSize: 16, fontWeight: "500", color: "#111827", marginTop: 12 }}>
                Start the conversation
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                  marginTop: 8,
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                Send your first message to {chat?.name || "this tutor"}.
              </Text>
            </View>
          )}
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
            disabled={!inputText.trim() || isSending}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: inputText.trim() && !isSending ? "#6C3FCF" : "#E5E7EB",
              justifyContent: "center",
              alignItems: "center",
              marginLeft: 10,
            }}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#9CA3AF" />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() ? "#FFFFFF" : "#9CA3AF"}
              />
            )}
          </TouchableOpacity>
        </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
