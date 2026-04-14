import React from "react";
import { TouchableOpacity, Text, View } from "react-native";

const FilterChip = ({
  label,
  selected,
  onPress,
  size = "default",
  icon = null,
}) => {
  const isSmall = size === "small";
  const paddingHorizontal = isSmall ? 12 : 16;
  const paddingVertical = isSmall ? 6 : 10;
  const fontSize = isSmall ? 12 : 14;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal,
        paddingVertical,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: selected ? "#6C3FCF" : "#E5E7EB",
        backgroundColor: selected ? "#6C3FCF" : "#FFFFFF",
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      {icon && (
        <View style={{ marginRight: 6 }}>
          {icon}
        </View>
      )}
      <Text
        style={{
          fontSize,
          fontWeight: "500",
          color: selected ? "#FFFFFF" : "#1A1A1A",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default FilterChip;
