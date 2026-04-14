import React, { useState } from "react";
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

const mockMessages = [
  {
    id: "1",
    text: "Hi, I'm interested in booking a math session for my son.",
    sender: "user",
    timestamp: "10:25 AM",
  },
  {
    id: "2",
    text: "Hello! I'd be happy to help. What grade is he in and what topics would you like to focus on?",
    sender: "other",
    timestamp: "10:27 AM",
  },
  {
    id: "3",
    text: "He's in grade 8. We need help with algebra and geometry.",
    sender: "user",
    timestamp: "10:28 AM",
  },
  {
    id: "4",
    text: "Perfect! I have extensive experience with those topics. I offer sessions on weekday evenings and weekends. Which would work better for you?",
    sender: "other",
    timestamp: "10:30 AM",
  },
];

const ChatScreen = ({ route }) => {
  const { chat } = route.params;
  const [messages, setMessages] = useState(mockMessages);
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };

    setMessages([...messages, newMessage]);
    setInputText("");
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
          {messages.map((message, index) => (
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
