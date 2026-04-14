import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

const SectionHeader = ({ title, onSeeAll, showSeeAll = true }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "500",
          color: "#1A1A1A",
        }}
      >
        {title}
      </Text>
      {showSeeAll && onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: "#6C3FCF",
            }}
          >
            See all
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SectionHeader;
