import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const StarRating = ({ rating, size = 14 }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {[...Array(fullStars)].map((_, index) => (
        <Ionicons
          key={`full-${index}`}
          name="star"
          size={size}
          color="#F59E0B"
          style={{ marginRight: 2 }}
        />
      ))}
      {hasHalfStar && (
        <Ionicons
          key="half"
          name="star-half"
          size={size}
          color="#F59E0B"
          style={{ marginRight: 2 }}
        />
      )}
      {[...Array(emptyStars)].map((_, index) => (
        <Ionicons
          key={`empty-${index}`}
          name="star-outline"
          size={size}
          color="#E5E7EB"
          style={{ marginRight: 2 }}
        />
      ))}
    </View>
  );
};

export default StarRating;
