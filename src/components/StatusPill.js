import React from "react";
import { View, Text } from "react-native";

const statusConfig = {
  Available: {
    text: "#1A1A1A",
    bg: "#EAF3DE",
    border: "#3B6D11",
  },
  Confirmed: {
    text: "#1A1A1A",
    bg: "#EAF3DE",
    border: "#3B6D11",
  },
  Busy: {
    text: "#854F0B",
    bg: "#FAEEDA",
    border: "#854F0B",
  },
  Pending: {
    text: "#FFFFFF",
    bg: "#6C3FCF",
    border: "#6C3FCF",
  },
  Online: {
    text: "#FFFFFF",
    bg: "#10B981",
    border: "#10B981",
  },
  Offline: {
    text: "#6B7280",
    bg: "#E5E7EB",
    border: "#9CA3AF",
  },
};

const StatusPill = ({ status, size = "default" }) => {
  const config = statusConfig[status] || statusConfig.Pending;
  const isSmall = size === "small";
  const paddingHorizontal = isSmall ? 8 : 12;
  const paddingVertical = isSmall ? 4 : 6;
  const fontSize = isSmall ? 10 : 12;

  return (
    <View
      style={{
        paddingHorizontal,
        paddingVertical,
        borderRadius: 20,
        backgroundColor: config.bg,
        borderWidth: 1,
        borderColor: config.border,
      }}
    >
      <Text
        style={{
          fontSize,
          fontWeight: "500",
          color: config.text,
        }}
      >
        {status}
      </Text>
    </View>
  );
};

export default StatusPill;
