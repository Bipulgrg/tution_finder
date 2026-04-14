import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

const AuthScreen = () => {
  const { register, verifyEmail, loginWithPassword } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async () => {
    setError(null);
    try {
      setSubmitting(true);

      if (isLogin) {
        await loginWithPassword({ email, password });
        return;
      }

      if (!isOtpStep) {
        if (!selectedRole) throw new Error("Please select a role");
        await register({ name, email, password, role: selectedRole });
        setIsOtpStep(true);
        return;
      }

      await verifyEmail({ email, otp });
    } catch (e) {
      setError(e?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F7" }}>
      <StatusBar backgroundColor="#F5F5F7" barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 24,
          justifyContent: "center",
        }}
      >
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#6C3FCF",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Ionicons name="school" size={40} color="#FFFFFF" />
          </View>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "500",
              color: "#1A1A1A",
              marginBottom: 8,
            }}
          >
            Tuition Finder
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#6B7280",
              textAlign: "center",
            }}
          >
            Find the perfect tutor for your child in Nepal
          </Text>
        </View>

        <Text
          style={{
            fontSize: 18,
            fontWeight: "500",
            color: "#1A1A1A",
            marginBottom: 16,
          }}
        >
          {isLogin ? "Sign in" : isOtpStep ? "Verify Email" : "Create account"}
        </Text>

        {!isLogin && !isOtpStep && (
          <View
            style={{
              flexDirection: "row",
              marginBottom: 24,
            }}
          >
            <TouchableOpacity
              onPress={() => setSelectedRole("parent")}
              activeOpacity={0.8}
              style={{
                flex: 1,
                backgroundColor: selectedRole === "parent" ? "#6C3FCF" : "#FFFFFF",
                borderRadius: 12,
                padding: 20,
                marginRight: 12,
                borderWidth: 2,
                borderColor: selectedRole === "parent" ? "#6C3FCF" : "#E5E7EB",
                alignItems: "center",
              }}
            >
              <Ionicons
                name="people"
                size={32}
                color={selectedRole === "parent" ? "#FFFFFF" : "#6B7280"}
                style={{ marginBottom: 8 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: selectedRole === "parent" ? "#FFFFFF" : "#1A1A1A",
                }}
              >
                Parent
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedRole("tutor")}
              activeOpacity={0.8}
              style={{
                flex: 1,
                backgroundColor: selectedRole === "tutor" ? "#6C3FCF" : "#FFFFFF",
                borderRadius: 12,
                padding: 20,
                borderWidth: 2,
                borderColor: selectedRole === "tutor" ? "#6C3FCF" : "#E5E7EB",
                alignItems: "center",
              }}
            >
              <Ionicons
                name="person"
                size={32}
                color={selectedRole === "tutor" ? "#FFFFFF" : "#6B7280"}
                style={{ marginBottom: 8 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: selectedRole === "tutor" ? "#FFFFFF" : "#1A1A1A",
                }}
              >
                Tutor
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLogin && !isOtpStep && (
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: "#1A1A1A",
                marginBottom: 8,
              }}
            >
              Full Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: "#1A1A1A",
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
            />
          </View>
        )}

        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: "#1A1A1A",
              marginBottom: 8,
            }}
          >
            Email
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            keyboardType="email-address"
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 16,
              color: "#1A1A1A",
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          />
        </View>

        {!isOtpStep && (
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: "#1A1A1A",
                marginBottom: 8,
              }}
            >
              Password
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: "#1A1A1A",
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
            />
          </View>
        )}

        {isOtpStep && (
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: "#1A1A1A",
                marginBottom: 8,
              }}
            >
              OTP Code
            </Text>
            <TextInput
              value={otp}
              onChangeText={setOtp}
              placeholder="6-digit code"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={6}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: "#1A1A1A",
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
            />
            <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 8 }}>
              We sent an OTP to your email. It expires in 5 minutes.
            </Text>
          </View>
        )}

        {error && (
          <Text style={{ color: "#B91C1C", marginBottom: 12 }}>
            {error}
          </Text>
        )}

        <TouchableOpacity
          onPress={handleAuth}
          disabled={submitting}
          activeOpacity={0.8}
          style={{
            backgroundColor:
              submitting ? "#C4B5E0" : "#6C3FCF",
            borderRadius: 8,
            paddingVertical: 16,
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: "#FFFFFF",
            }}
          >
            {submitting
              ? "Please wait..."
              : isLogin
                ? "Sign In"
                : isOtpStep
                  ? "Verify"
                  : "Register"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setIsLogin(!isLogin);
            setIsOtpStep(false);
            setOtp("");
            setError(null);
          }}
          style={{ alignItems: "center" }}
        >
          <Text
            style={{
              fontSize: 14,
              color: "#6C3FCF",
              fontWeight: "500",
            }}
          >
            {isLogin
              ? "Don't have an account? Register"
              : "Already have an account? Sign In"}
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 12,
            color: "#9CA3AF",
            textAlign: "center",
            marginTop: 24,
          }}
        >
          Serving Kathmandu, Lalitpur, Bhaktapur, and Pokhara
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AuthScreen;
