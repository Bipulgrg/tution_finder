import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useTutor } from "../../context/TutorContext";
import TutorCard from "../../components/TutorCard";
import FilterChip from "../../components/FilterChip";
import SectionHeader from "../../components/SectionHeader";

const subjects = [
  "Mathematics",
  "Science",
  "English",
  "Nepali",
  "Physics",
  "Computer",
  "Social Studies",
];

const ParentHomeScreen = ({ navigation }) => {
  const { userName } = useAuth();
  const { tutorList, toggleSaveTutor, isTutorSaved, applyFilters } = useTutor();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleSubjectFilter = (subject) => {
    if (selectedSubject === subject) {
      setSelectedSubject(null);
      applyFilters({
        subjects: [],
        gradeLevels: [],
        areas: [],
        minBudget: 0,
        maxBudget: 2000,
        availability: [],
      });
    } else {
      setSelectedSubject(subject);
      applyFilters({
        subjects: [subject],
        gradeLevels: [],
        areas: [],
        minBudget: 0,
        maxBudget: 2000,
        availability: [],
      });
    }
  };

  const filteredTutors = tutorList.filter(
    (tutor) =>
      tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.subjects.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F7" }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={{ padding: 16 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "500",
              color: "#1A1A1A",
              marginBottom: 16,
            }}
          >
            Namaste, {userName || "Parent"}!
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search tutors, subjects..."
              placeholderTextColor="#9CA3AF"
              style={{
                flex: 1,
                marginLeft: 10,
                fontSize: 16,
                color: "#1A1A1A",
              }}
            />
          </View>

          <SectionHeader
            title="Popular Subjects"
            onSeeAll={() => navigation.navigate("Search")}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            {subjects.map((subject) => (
              <FilterChip
                key={subject}
                label={subject}
                selected={selectedSubject === subject}
                onPress={() => handleSubjectFilter(subject)}
                size="small"
              />
            ))}
          </ScrollView>

          <SectionHeader
            title="Recommended Tutors"
            showSeeAll={false}
          />

          {filteredTutors.map((tutor) => (
            <TutorCard
              key={tutor.id}
              tutor={tutor}
              isSaved={isTutorSaved(tutor.id)}
              onPress={(t) => navigation.navigate("TutorProfile", { tutor: t })}
              onSave={(t) => toggleSaveTutor(t.id)}
            />
          ))}

          {filteredTutors.length === 0 && (
            <View
              style={{
                alignItems: "center",
                paddingVertical: 40,
              }}
            >
              <Ionicons name="search-outline" size={48} color="#9CA3AF" />
              <Text
                style={{
                  fontSize: 16,
                  color: "#6B7280",
                  marginTop: 12,
                }}
              >
                No tutors found matching your search
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ParentHomeScreen;
