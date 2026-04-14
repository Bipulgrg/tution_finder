import React from "react";
import { View, Text } from "react-native";

const colorMap = [
  "#6C3FCF", // Primary purple
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#06B6D4", // Cyan
];

const getColorFromName = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorMap[Math.abs(hash) % colorMap.length];
};

const AvatarInitials = ({ name, initials, size = 48 }) => {
  const backgroundColor = getColorFromName(name);
  const fontSize = size * 0.4;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: "#FFFFFF",
          fontSize,
          fontWeight: "500",
        }}
      >
        {initials}
      </Text>
    </View>
  );
};

export default AvatarInitials;
