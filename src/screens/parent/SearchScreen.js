import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTutor } from "../../context/TutorContext";
import FilterChip from "../../components/FilterChip";
import TutorCard from "../../components/TutorCard";
import SectionHeader from "../../components/SectionHeader";

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Nepali",
  "Science",
  "Computer Science",
  "Social Studies",
  "Accounts",
];

const gradeLevels = ["1-5", "6-8", "9-10", "11-12", "Bachelor"];

const areas = ["Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Online"];

const availabilityOptions = [
  "Weekday mornings",
  "Weekday evenings",
  "Weekends",
];

const SearchScreen = ({ navigation }) => {
  const { filteredList, toggleSaveTutor, isTutorSaved, applyFilters, clearFilters } = useTutor();
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState({
    subjects: [],
    gradeLevels: [],
    areas: [],
    minBudget: "200",
    maxBudget: "2000",
    availability: [],
  });

  const toggleFilter = (category, value) => {
    setFilters((prev) => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const handleShowResults = () => {
    applyFilters({
      ...filters,
      minBudget: parseInt(filters.minBudget) || 0,
      maxBudget: parseInt(filters.maxBudget) || 2000,
    });
    setShowResults(true);
  };

  const handleClear = () => {
    setFilters({
      subjects: [],
      gradeLevels: [],
      areas: [],
      minBudget: "200",
      maxBudget: "2000",
      availability: [],
    });
    clearFilters();
    setShowResults(false);
  };

  if (showResults) {
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
          <TouchableOpacity onPress={() => setShowResults(false)} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text
            style={{
              flex: 1,
              fontSize: 18,
              fontWeight: "500",
              color: "#1A1A1A",
            }}
          >
            {filteredList.length} Tutor{filteredList.length !== 1 ? "s" : ""} Found
          </Text>
          <TouchableOpacity onPress={handleClear}>
            <Text style={{ color: "#6C3FCF", fontWeight: "500" }}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {filteredList.map((tutor) => (
            <TutorCard
              key={tutor.id}
              tutor={tutor}
              isSaved={isTutorSaved(tutor.id)}
              onPress={(t) => navigation.navigate("TutorProfile", { tutor: t })}
              onSave={(t) => toggleSaveTutor(t.id)}
            />
          ))}

          {filteredList.length === 0 && (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <Ionicons name="search-outline" size={48} color="#9CA3AF" />
              <Text
                style={{
                  fontSize: 16,
                  color: "#6B7280",
                  marginTop: 12,
                  textAlign: "center",
                }}
              >
                No tutors found matching your filters.\nTry adjusting your criteria.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F7" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <SectionHeader title="Subject" showSeeAll={false} />
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {subjects.map((subject) => (
            <FilterChip
              key={subject}
              label={subject}
              selected={filters.subjects.includes(subject)}
              onPress={() => toggleFilter("subjects", subject)}
            />
          ))}
        </View>

        <SectionHeader title="Grade Level" showSeeAll={false} />
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {gradeLevels.map((grade) => (
            <FilterChip
              key={grade}
              label={grade}
              selected={filters.gradeLevels.includes(grade)}
              onPress={() => toggleFilter("gradeLevels", grade)}
            />
          ))}
        </View>

        <SectionHeader title="Area" showSeeAll={false} />
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {areas.map((area) => (
            <FilterChip
              key={area}
              label={area}
              selected={filters.areas.includes(area)}
              onPress={() => toggleFilter("areas", area)}
            />
          ))}
        </View>

        <SectionHeader title="Budget Range (Rs/hr)" showSeeAll={false} />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <TextInput
            value={filters.minBudget}
            onChangeText={(text) =>
              setFilters((prev) => ({ ...prev, minBudget: text }))
            }
            placeholder="Min"
            keyboardType="numeric"
            style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          />
          <Text style={{ marginHorizontal: 12, color: "#6B7280" }}>to</Text>
          <TextInput
            value={filters.maxBudget}
            onChangeText={(text) =>
              setFilters((prev) => ({ ...prev, maxBudget: text }))
            }
            placeholder="Max"
            keyboardType="numeric"
            style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          />
        </View>

        <SectionHeader title="Availability" showSeeAll={false} />
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {availabilityOptions.map((option) => (
            <FilterChip
              key={option}
              label={option}
              selected={filters.availability.includes(option)}
              onPress={() => toggleFilter("availability", option)}
            />
          ))}
        </View>
      </ScrollView>

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          paddingHorizontal: 16,
          paddingVertical: 12,
          paddingBottom: 24,
        }}
      >
        <TouchableOpacity
          onPress={handleShowResults}
          activeOpacity={0.8}
          style={{
            backgroundColor: "#6C3FCF",
            borderRadius: 8,
            paddingVertical: 16,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: "#FFFFFF",
            }}
          >
            Show Results
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SearchScreen;
