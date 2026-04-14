import React, { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "../api/client";
import { useAuth } from "./AuthContext";

const TutorContext = createContext();

const initialState = {
  tutorList: [],
  filteredList: [],
  savedTutors: [],
  activeFilters: {
    subjects: [],
    gradeLevels: [],
    areas: [],
    minBudget: 0,
    maxBudget: 2000,
    availability: [],
  },
};

const tutorReducer = (state, action) => {
  switch (action.type) {
    case "SET_TUTORS":
      return {
        ...state,
        tutorList: action.payload,
        filteredList: action.payload,
      };
    case "SET_FILTERED_LIST":
      return {
        ...state,
        filteredList: action.payload,
      };
    case "SET_SAVED_TUTORS":
      return {
        ...state,
        savedTutors: action.payload,
      };
    case "TOGGLE_SAVE_TUTOR": {
      const tutorId = action.payload;
      const isSaved = state.savedTutors.includes(tutorId);
      const newSavedTutors = isSaved
        ? state.savedTutors.filter((id) => id !== tutorId)
        : [...state.savedTutors, tutorId];
      return {
        ...state,
        savedTutors: newSavedTutors,
      };
    }
    case "SET_ACTIVE_FILTERS":
      return {
        ...state,
        activeFilters: action.payload,
      };
    case "CLEAR_FILTERS":
      return {
        ...state,
        activeFilters: initialState.activeFilters,
        filteredList: state.tutorList,
      };
    default:
      return state;
  }
};

export const TutorProvider = ({ children }) => {
  const [state, dispatch] = useReducer(tutorReducer, initialState);
  const { isLoggedIn, role } = useAuth();

  useEffect(() => {
    loadTutors();
  }, []);

  useEffect(() => {
    if (isLoggedIn && role === "parent") {
      loadSavedTutors();
    }
  }, [isLoggedIn, role]);

  const mapTutor = (item) => {
    const name = item?.user?.name || "";
    const initials = name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();

    const subjects = Array.isArray(item.subjects) ? item.subjects.map((s) => s.subject) : [];
    const gradeRanges = Array.isArray(item.subjects) ? item.subjects.map((s) => s.gradeRange) : [];
    const gradeRange = [...new Set(gradeRanges)].join(", ");

    return {
      id: item.userId,
      name,
      initials,
      subjects,
      gradeRange,
      ratePerHour: item.hourlyRate,
      rating: item.ratingAvg,
      reviewCount: item.reviewCount,
      area: item.area,
      availability: item.availability || [],
      experience: item.experienceYears || 0,
      studentCount: item.studentCount || 0,
      bio: item.bio || "",
      education: { degree: item.degree || "", university: item.university || "" },
      isOnline: Boolean(item.isOnline),
      isSaved: false,
      profilePhotoUrl: item?.user?.profilePhotoUrl || null,
    };
  };

  const loadTutors = async () => {
    try {
      const res = await apiRequest("/api/tutors", { method: "GET" });
      const items = Array.isArray(res?.data) ? res.data : [];
      const mapped = items.map(mapTutor);
      if (mapped.length > 0) {
        dispatch({ type: "SET_TUTORS", payload: mapped });
      }
    } catch (error) {
      console.error("Error loading tutors:", error);
    }
  };

  useEffect(() => {
    saveSavedTutors();
  }, [state.savedTutors]);

  const loadSavedTutors = async () => {
    try {
      if (isLoggedIn && role === "parent") {
        const res = await apiRequest("/api/saved", { method: "GET" });
        const list = Array.isArray(res?.data) ? res.data : [];
        const ids = list.map((i) => (i.tutorId?._id ? i.tutorId._id : i.tutorId)).filter(Boolean);
        dispatch({ type: "SET_SAVED_TUTORS", payload: ids });
        return;
      }

      const saved = await AsyncStorage.getItem("savedTutors");
      if (saved) dispatch({ type: "SET_SAVED_TUTORS", payload: JSON.parse(saved) });
    } catch (error) {
      console.error("Error loading saved tutors:", error);
    }
  };

  const saveSavedTutors = async () => {
    try {
      await AsyncStorage.setItem(
        "savedTutors",
        JSON.stringify(state.savedTutors)
      );
    } catch (error) {
      console.error("Error saving saved tutors:", error);
    }
  };

  const toggleSaveTutor = (tutorId) => {
    if (isLoggedIn && role === "parent") {
      const isSaved = state.savedTutors.includes(tutorId);
      const req = isSaved
        ? apiRequest(`/api/saved/${tutorId}`, { method: "DELETE" })
        : apiRequest(`/api/saved/${tutorId}`, { method: "POST" });

      req
        .then(() => {
          dispatch({ type: "TOGGLE_SAVE_TUTOR", payload: tutorId });
        })
        .catch((e) => {
          console.error("Error toggling saved tutor:", e);
        });
      return;
    }

    dispatch({ type: "TOGGLE_SAVE_TUTOR", payload: tutorId });
  };

  const isTutorSaved = (tutorId) => {
    return state.savedTutors.includes(tutorId);
  };

  const applyFilters = (filters) => {
    let filtered = [...state.tutorList];

    if (filters.subjects.length > 0) {
      filtered = filtered.filter((tutor) =>
        tutor.subjects.some((subject) => filters.subjects.includes(subject))
      );
    }

    if (filters.gradeLevels.length > 0) {
      filtered = filtered.filter((tutor) =>
        filters.gradeLevels.some((grade) =>
          tutor.gradeRange.includes(grade.replace("11-12", "11").replace("+", ""))
        )
      );
    }

    if (filters.areas.length > 0) {
      filtered = filtered.filter(
        (tutor) =>
          filters.areas.includes(tutor.area) ||
          (filters.areas.includes("Online") && tutor.isOnline)
      );
    }

    if (filters.minBudget > 0 || filters.maxBudget < 2000) {
      filtered = filtered.filter(
        (tutor) =>
          tutor.ratePerHour >= filters.minBudget &&
          tutor.ratePerHour <= filters.maxBudget
      );
    }

    if (filters.availability.length > 0) {
      filtered = filtered.filter((tutor) =>
        tutor.availability.some((avail) => filters.availability.includes(avail))
      );
    }

    dispatch({ type: "SET_FILTERED_LIST", payload: filtered });
    dispatch({ type: "SET_ACTIVE_FILTERS", payload: filters });
  };

  const clearFilters = () => {
    dispatch({ type: "CLEAR_FILTERS" });
  };

  const value = {
    ...state,
    toggleSaveTutor,
    isTutorSaved,
    applyFilters,
    clearFilters,
  };

  return <TutorContext.Provider value={value}>{children}</TutorContext.Provider>;
};

export const useTutor = () => {
  const context = useContext(TutorContext);
  if (!context) {
    throw new Error("useTutor must be used within a TutorProvider");
  }
  return context;
};

export default TutorContext;
