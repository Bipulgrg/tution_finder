import React, { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "../api/client";
import { useAuth } from "./AuthContext";

const BookingContext = createContext();

const initialState = {
  pendingBooking: null,
  confirmedBookings: [],
};

const bookingReducer = (state, action) => {
  switch (action.type) {
    case "SET_PENDING_BOOKING":
      return { ...state, pendingBooking: action.payload };
    case "CLEAR_PENDING_BOOKING":
      return { ...state, pendingBooking: null };
    case "ADD_CONFIRMED_BOOKING":
      return { ...state, confirmedBookings: [action.payload, ...state.confirmedBookings] };
    case "SET_CONFIRMED_BOOKINGS":
      return { ...state, confirmedBookings: action.payload };
    case "UPDATE_BOOKING_STATUS": {
      const { bookingId, status } = action.payload;
      return {
        ...state,
        confirmedBookings: state.confirmedBookings.map((booking) =>
          booking.id === bookingId ? { ...booking, status } : booking
        ),
      };
    }
    default:
      return state;
  }
};

export const BookingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  useEffect(() => {
    saveBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.confirmedBookings]);

  const loadBookings = async () => {
    try {
      if (isLoggedIn) {
        const res = await apiRequest("/api/bookings?limit=50", { method: "GET" });
        const items = Array.isArray(res?.data) ? res.data : [];
        const mapped = items.map((b) => ({
          id: b._id,
          bookingRef: b.bookingRef,
          tutorId: b?.tutorId?._id || b.tutorId,
          tutorName: b?.tutorId?.name,
          studentName: b?.parentId?.name,
          subject: b.subject,
          date: b.sessionDate ? new Date(b.sessionDate).toISOString().split("T")[0] : "",
          time: b.timeSlot,
          sessionType: b.sessionType === "online" ? "Online" : "In-person",
          amount: b.totalAmount,
          status: (b.status || "").charAt(0).toUpperCase() + (b.status || "").slice(1),
        }));
        dispatch({ type: "SET_CONFIRMED_BOOKINGS", payload: mapped });
        return;
      }

      const bookings = await AsyncStorage.getItem("confirmedBookings");
      if (bookings) {
        dispatch({ type: "SET_CONFIRMED_BOOKINGS", payload: JSON.parse(bookings) });
      }
    } catch (error) {
      console.error("Error loading bookings:", error);
    }
  };

  const saveBookings = async () => {
    try {
      await AsyncStorage.setItem("confirmedBookings", JSON.stringify(state.confirmedBookings));
    } catch (error) {
      console.error("Error saving bookings:", error);
    }
  };

  const setPendingBooking = (booking) => {
    dispatch({ type: "SET_PENDING_BOOKING", payload: booking });
  };

  const clearPendingBooking = () => {
    dispatch({ type: "CLEAR_PENDING_BOOKING" });
  };

  const confirmBooking = (bookingDetails) => {
    if (isLoggedIn) {
      const body = {
        tutorId: bookingDetails.tutorId,
        subject: bookingDetails.subject,
        gradeRange: bookingDetails.gradeRange || "N/A",
        sessionDate: bookingDetails.date,
        timeSlot: bookingDetails.time,
        sessionType: bookingDetails.sessionType === "Online" ? "online" : "in-person",
        durationHours: bookingDetails.sessions || 1,
      };

      return apiRequest("/api/bookings", { method: "POST", body }).then((res) => {
        const b = res?.data?.booking;
        const createdBooking = {
          ...bookingDetails,
          id: b?._id || bookingDetails.id,
          bookingRef: b?.bookingRef,
          status: "Pending",
          bookedAt: new Date().toISOString(),
        };
        dispatch({ type: "ADD_CONFIRMED_BOOKING", payload: createdBooking });
        dispatch({ type: "CLEAR_PENDING_BOOKING" });
        return createdBooking;
      });
    }

    const bookingId = `TF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdBooking = {
      ...bookingDetails,
      id: bookingId,
      status: "Confirmed",
      bookedAt: new Date().toISOString(),
    };
    dispatch({ type: "ADD_CONFIRMED_BOOKING", payload: createdBooking });
    dispatch({ type: "CLEAR_PENDING_BOOKING" });
    return createdBooking;
  };

  const tutorConfirmBooking = async (bookingId) => {
    const res = await apiRequest(`/api/bookings/${bookingId}/confirm`, { method: "PUT" });
    const b = res?.data?.booking;
    dispatch({
      type: "UPDATE_BOOKING_STATUS",
      payload: { bookingId: b?._id || bookingId, status: "Confirmed" },
    });
    return b;
  };

  const tutorUnconfirmBooking = async (bookingId) => {
    const res = await apiRequest(`/api/bookings/${bookingId}/unconfirm`, { method: "PUT" });
    const b = res?.data?.booking;
    dispatch({
      type: "UPDATE_BOOKING_STATUS",
      payload: { bookingId: b?._id || bookingId, status: "Pending" },
    });
    return b;
  };

  const tutorCompleteBooking = async (bookingId) => {
    const res = await apiRequest(`/api/bookings/${bookingId}/complete`, { method: "PUT" });
    const b = res?.data?.booking;
    dispatch({
      type: "UPDATE_BOOKING_STATUS",
      payload: { bookingId: b?._id || bookingId, status: "Completed" },
    });
    return b;
  };

  const updateBookingStatus = (bookingId, status) => {
    dispatch({ type: "UPDATE_BOOKING_STATUS", payload: { bookingId, status } });
  };

  const getTutorBookings = (tutorId) => {
    return state.confirmedBookings.filter((booking) => booking.tutorId === tutorId);
  };

  const value = {
    ...state,
    refreshBookings: loadBookings,
    setPendingBooking,
    clearPendingBooking,
    confirmBooking,
    tutorConfirmBooking,
    tutorUnconfirmBooking,
    tutorCompleteBooking,
    updateBookingStatus,
    getTutorBookings,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error("useBooking must be used within a BookingProvider");
  return context;
};

export default BookingContext;

