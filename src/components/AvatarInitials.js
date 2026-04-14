import React from "react";
import { Image, Text, View } from "react-native";

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.toString().trim().split(/\s+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return initials || "U";
};

const AvatarInitials = ({ name, initials, size = 48, photoUrl = null }) => {
  const text = (initials || getInitials(name)).toString().slice(0, 2).toUpperCase();
  const radius = Math.floor(size / 2);

  if (photoUrl) {
    return (
      <Image
        source={{ uri: photoUrl }}
        style={{ width: size, height: size, borderRadius: radius, backgroundColor: "#E5E7EB" }}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: "#EEF2FF",
        borderWidth: 1,
        borderColor: "#6C3FCF",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: Math.max(12, Math.floor(size / 3)), fontWeight: "600", color: "#6C3FCF" }}>
        {text}
      </Text>
    </View>
  );
};

export default AvatarInitials;
