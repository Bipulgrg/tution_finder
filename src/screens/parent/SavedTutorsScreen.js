import React from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTutor } from "../../context/TutorContext";
import TutorCard from "../../components/TutorCard";
import SectionHeader from "../../components/SectionHeader";

const SavedTutorsScreen = ({ navigation }) => {
  const { tutorList, savedTutors, toggleSaveTutor, isTutorSaved } = useTutor();

  const savedTutorList = tutorList.filter((tutor) =>
    savedTutors.includes(tutor.id)
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F7" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 20 }}>
        <SectionHeader title="Saved Tutors" showSeeAll={false} />

        {savedTutorList.length > 0 ? (
          savedTutorList.map((tutor) => (
            <TutorCard
              key={tutor.id}
              tutor={tutor}
              isSaved={isTutorSaved(tutor.id)}
              onPress={(t) => navigation.navigate("TutorProfile", { tutor: t })}
              onSave={(t) => toggleSaveTutor(t.id)}
            />
          ))
        ) : (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 60,
            }}
          >
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: "#F3F4F6",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Ionicons name="heart-outline" size={60} color="#9CA3AF" />
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "500",
                color: "#1A1A1A",
                marginBottom: 8,
              }}
            >
              No saved tutors yet
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
                textAlign: "center",
                maxWidth: 250,
              }}
            >
              Tap the heart icon on tutor profiles to save them for later
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SavedTutorsScreen;
