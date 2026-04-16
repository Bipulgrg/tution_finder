import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import FilterChip from "../../components/FilterChip";
import { subjects, gradeLevels, areas, availabilityOptions } from "../../data/mockTutors";
import { apiRequest } from "../../api/client";

const TutorProfileSetupScreen = ({ navigation }) => {
  const { userName, logout, user, updateCurrentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const userEmail = user?.email || "";

  const [profile, setProfile] = useState({
    name: userName || "",
    phone: user?.phone || "",
    email: userEmail || "",
    subjects: [],
    grades: [],
    ratePerHour: "",
    areas: [],
    availability: [],
    bio: "",
    degree: "",
    university: "",
    experience: "",
  });

  const toggleArrayField = (field, value) => {
    setProfile((prev) => {
      const current = prev[field];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return profile.name && profile.phone;
      case 2:
        return profile.subjects.length > 0 && profile.ratePerHour;
      case 3:
        return profile.bio && profile.degree;
      default:
        return false;
    }
  };

  const subjectItems = useMemo(() => {
    const grade = profile.grades[0] || "6-8";
    return profile.subjects.map((s) => ({ subject: s, gradeRange: grade }));
  }, [profile.subjects, profile.grades]);

  const apiPayload = useMemo(() => {
    const area = profile.areas.includes("Online") ? "Online" : profile.areas[0] || "Kathmandu";
    return {
      bio: profile.bio || "",
      degree: profile.degree || "",
      university: profile.university || "",
      experienceYears: profile.experience ? Number(profile.experience) : 0,
      hourlyRate: Number(profile.ratePerHour),
      subjects: subjectItems,
      availability: profile.availability,
      area,
      alsoTeachesOnline: profile.areas.includes("Online"),
    };
  }, [profile, subjectItems]);

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      // Prefer update, fall back to create.
      try {
        await apiRequest("/api/tutors/profile", { method: "PUT", body: apiPayload });
      } catch (e) {
        if (e?.status === 404 || e?.status === 409) {
          await apiRequest("/api/tutors/profile", { method: "POST", body: apiPayload });
        } else {
          throw e;
        }
      }
      // Also keep user's phone in sync so parents can contact tutors.
      const updatedMe = await apiRequest("/api/users/me", {
        method: "PUT",
        body: {
          name: profile.name || userName,
          phone: profile.phone,
        },
      });
      if (updatedMe?.data?.user) {
        await updateCurrentUser(updatedMe.data.user);
      }
      alert("Profile saved! Your profile will be reviewed/updated.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      if (!canProceed()) return;
      try {
        await saveProfile();
        navigation?.navigate?.("Dashboard");
      } catch (e) {
        console.error("Profile save failed:", e);
        alert(e?.message || "Failed to save profile");
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep1 = () => (
    <View>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "500",
          color: "#1A1A1A",
          marginBottom: 20,
        }}
      >
        Personal Information
      </Text>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: "500", color: "#1A1A1A", marginBottom: 8 }}>
          Full Name
        </Text>
        <TextInput
          value={profile.name}
          onChangeText={(text) => setProfile({ ...profile, name: text })}
          placeholder="Your full name"
          style={styles.input}
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: "500", color: "#1A1A1A", marginBottom: 8 }}>
          Phone Number
        </Text>
        <TextInput
          value={profile.phone}
          onChangeText={(text) => setProfile({ ...profile, phone: text })}
          placeholder="98XXXXXXXX"
          keyboardType="phone-pad"
          style={styles.input}
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: "500", color: "#1A1A1A", marginBottom: 8 }}>
          Email
        </Text>
        <TextInput
          value={profile.email}
          onChangeText={(text) => setProfile({ ...profile, email: text })}
          placeholder="your@email.com"
          keyboardType="email-address"
          style={styles.input}
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: "500", color: "#1A1A1A", marginBottom: 8 }}>
          Profile Photo
        </Text>
        <TouchableOpacity style={styles.photoUpload}>
          <Ionicons name="camera-outline" size={32} color="#6B7280" />
          <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 8 }}>
            Tap to upload photo
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "500",
          color: "#1A1A1A",
          marginBottom: 20,
        }}
      >
        Teaching Details
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "500", color: "#1A1A1A", marginBottom: 12 }}>
        Subjects You Teach
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }}>
        {subjects.map((subject) => (
          <FilterChip
            key={subject}
            label={subject}
            selected={profile.subjects.includes(subject)}
            onPress={() => toggleArrayField("subjects", subject)}
          />
        ))}
      </View>

      <Text style={{ fontSize: 16, fontWeight: "500", color: "#1A1A1A", marginBottom: 12 }}>
        Grade Levels
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }}>
        {gradeLevels.map((grade) => (
          <FilterChip
            key={grade}
            label={grade}
            selected={profile.grades.includes(grade)}
            onPress={() => toggleArrayField("grades", grade)}
          />
        ))}
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: "500", color: "#1A1A1A", marginBottom: 8 }}>
          Hourly Rate (Rs)
        </Text>
        <TextInput
          value={profile.ratePerHour}
          onChangeText={(text) => setProfile({ ...profile, ratePerHour: text })}
          placeholder="e.g., 800"
          keyboardType="numeric"
          style={styles.input}
        />
      </View>

      <Text style={{ fontSize: 16, fontWeight: "500", color: "#1A1A1A", marginBottom: 12 }}>
        Areas You Teach
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }}>
        {areas.map((area) => (
          <FilterChip
            key={area}
            label={area}
            selected={profile.areas.includes(area)}
            onPress={() => toggleArrayField("areas", area)}
          />
        ))}
      </View>

      <Text style={{ fontSize: 16, fontWeight: "500", color: "#1A1A1A", marginBottom: 12 }}>
        Your Availability
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }}>
        {availabilityOptions.map((option) => (
          <FilterChip
            key={option}
            label={option}
            selected={profile.availability.includes(option)}
            onPress={() => toggleArrayField("availability", option)}
          />
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "500",
          color: "#1A1A1A",
          marginBottom: 20,
        }}
      >
        Bio & Education
      </Text>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: "500", color: "#1A1A1A", marginBottom: 8 }}>
          About You
        </Text>
        <TextInput
          value={profile.bio}
          onChangeText={(text) => setProfile({ ...profile, bio: text })}
          placeholder="Tell parents about your teaching style and experience..."
          multiline
          numberOfLines={4}
          style={[styles.input, { height: 100, textAlignVertical: "top" }]}
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: "500", color: "#1A1A1A", marginBottom: 8 }}>
          Highest Degree
        </Text>
        <TextInput
          value={profile.degree}
          onChangeText={(text) => setProfile({ ...profile, degree: text })}
          placeholder="e.g., M.Sc. Mathematics"
          style={styles.input}
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, fontWeight: "500", color: "#1A1A1A", marginBottom: 8 }}>
          University/Institution
        </Text>
        <TextInput
          value={profile.university}
          onChangeText={(text) => setProfile({ ...profile, university: text })}
          placeholder="e.g., Tribhuvan University"
          style={styles.input}
        />
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 14, fontWeight: "500", color: "#1A1A1A", marginBottom: 8 }}>
          Years of Experience
        </Text>
        <TextInput
          value={profile.experience}
          onChangeText={(text) => setProfile({ ...profile, experience: text })}
          placeholder="e.g., 5"
          keyboardType="numeric"
          style={styles.input}
        />
      </View>

      <TouchableOpacity
        onPress={handleNext}
        disabled={!canProceed()}
        style={{
          backgroundColor: canProceed() ? "#6C3FCF" : "#C4B5E0",
          borderRadius: 8,
          paddingVertical: 16,
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "500", color: "#FFFFFF" }}>
          Go Live
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F7" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "500", color: "#1A1A1A" }}>Tutor Profile</Text>
        <TouchableOpacity onPress={logout} style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={{ marginLeft: 6, color: "#EF4444", fontWeight: "500" }}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: s <= step ? "#6C3FCF" : "#E5E7EB",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: s <= step ? "#FFFFFF" : "#6B7280",
                    fontWeight: "500",
                  }}
                >
                  {s}
                </Text>
              </View>
              {s < 3 && (
                <View
                  style={{
                    width: 40,
                    height: 2,
                    backgroundColor: s < step ? "#6C3FCF" : "#E5E7EB",
                    marginHorizontal: 4,
                  }}
                />
              )}
            </View>
          ))}
        </View>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      {step < 3 && (
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
            flexDirection: "row",
          }}
        >
          {step > 1 && (
            <TouchableOpacity
              onPress={handleBack}
              style={{
                width: 100,
                paddingVertical: 16,
                alignItems: "center",
                marginRight: 12,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "500", color: "#6B7280" }}>
                Back
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleNext}
            disabled={!canProceed() || isSaving}
            style={{
              flex: 1,
              backgroundColor: canProceed() && !isSaving ? "#6C3FCF" : "#C4B5E0",
              borderRadius: 8,
              paddingVertical: 16,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "500", color: "#FFFFFF" }}>
              {step === 3 ? (isSaving ? "Saving..." : "Save Profile") : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = {
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  photoUpload: {
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
};

export default TutorProfileSetupScreen;
