import React, { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BookingContext = createContext();

const initialState = {
  pendingBooking: null,
  confirmedBookings: [],
};

const bookingReducer = (state, action) => {
  switch (action.type) {
    case "SET_PENDING_BOOKING":
      return {
        ...state,
        pendingBooking: action.payload,
      };
    case "CLEAR_PENDING_BOOKING":
      return {
        ...state,
        pendingBooking: null,
      };
    case "ADD_CONFIRMED_BOOKING":
      return {
        ...state,
        confirmedBookings: [action.payload, ...state.confirmedBookings],
      };
    case "SET_CONFIRMED_BOOKINGS":
      return {
        ...state,
        confirmedBookings: action.payload,
      };
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

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    saveBookings();
  }, [state.confirmedBookings]);

  const loadBookings = async () => {
    try {
      const bookings = await AsyncStorage.getItem("confirmedBookings");
      if (bookings) {
        dispatch({
          type: "SET_CONFIRMED_BOOKINGS",
          payload: JSON.parse(bookings),
        });
      }
    } catch (error) {
      console.error("Error loading bookings:", error);
    }
  };

  const saveBookings = async () => {
    try {
      await AsyncStorage.setItem(
        "confirmedBookings",
        JSON.stringify(state.confirmedBookings)
      );
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
    const bookingId = `TF-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const confirmedBooking = {
      ...bookingDetails,
      id: bookingId,
      status: "Confirmed",
      bookedAt: new Date().toISOString(),
    };

    dispatch({ type: "ADD_CONFIRMED_BOOKING", payload: confirmedBooking });
    dispatch({ type: "CLEAR_PENDING_BOOKING" });

    return confirmedBooking;
  };

  const updateBookingStatus = (bookingId, status) => {
    dispatch({
      type: "UPDATE_BOOKING_STATUS",
      payload: { bookingId, status },
    });
  };

  const getTutorBookings = (tutorId) => {
    return state.confirmedBookings.filter(
      (booking) => booking.tutorId === tutorId
    );
  };

  const value = {
    ...state,
    setPendingBooking,
    clearPendingBooking,
    confirmBooking,
    updateBookingStatus,
    getTutorBookings,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};

export default BookingContext;
