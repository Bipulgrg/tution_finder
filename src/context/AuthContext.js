import React, { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "../api/client";

const AuthContext = createContext();

const initialState = {
  role: null,
  user: null,
  isLoggedIn: false,
  isLoading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "SET_AUTH":
      return {
        ...state,
        role: action.payload.role,
        user: action.payload.user,
        isLoggedIn: action.payload.isLoggedIn,
        isLoading: false,
      };
    case "LOGIN":
      return {
        ...state,
        role: action.payload.role,
        user: action.payload.user,
        isLoggedIn: true,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        ...initialState,
        isLoading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
    try {
      const role = await AsyncStorage.getItem("role");
      const userJson = await AsyncStorage.getItem("user");
      const accessToken = await AsyncStorage.getItem("accessToken");

      dispatch({
        type: "SET_AUTH",
        payload: {
          role: role || null,
          user: userJson ? JSON.parse(userJson) : null,
          isLoggedIn: Boolean(accessToken),
        },
      });
    } catch (error) {
      console.error("Error loading auth data:", error);
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const register = async ({ name, email, password, role, phone }) => {
    await apiRequest("/api/auth/register", {
      method: "POST",
      body: { name, email, password, role, phone },
    });
  };

  const verifyEmail = async ({ email, otp }) => {
    const res = await apiRequest("/api/auth/verify-email", {
      method: "POST",
      body: { email, otp },
    });

    const { accessToken, refreshToken, user } = res?.data || {};
    if (!accessToken || !refreshToken || !user) {
      throw new Error("Invalid verify response");
    }

    await AsyncStorage.setItem("accessToken", accessToken);
    await AsyncStorage.setItem("refreshToken", refreshToken);
    await AsyncStorage.setItem("role", user.role);
    await AsyncStorage.setItem("user", JSON.stringify(user));

    dispatch({
      type: "LOGIN",
      payload: { role: user.role, user },
    });
  };

  const loginWithPassword = async ({ email, password }) => {
    const res = await apiRequest("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });

    const { accessToken, refreshToken, user } = res?.data || {};
    if (!accessToken || !refreshToken || !user) {
      throw new Error("Invalid login response");
    }

    await AsyncStorage.setItem("accessToken", accessToken);
    await AsyncStorage.setItem("refreshToken", refreshToken);
    await AsyncStorage.setItem("role", user.role);
    await AsyncStorage.setItem("user", JSON.stringify(user));

    dispatch({
      type: "LOGIN",
      payload: { role: user.role, user },
    });
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("role");
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");

      dispatch({ type: "LOGOUT" });
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  };

  const updateCurrentUser = async (nextUser) => {
    await AsyncStorage.setItem("user", JSON.stringify(nextUser));
    dispatch({ type: "UPDATE_USER", payload: nextUser });
  };

  const value = {
    ...state,
    userId: state.user?.id || state.user?._id || null,
    userName: state.user?.name || "",
    register,
    verifyEmail,
    loginWithPassword,
    logout,
    updateCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
