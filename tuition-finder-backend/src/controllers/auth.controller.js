const { apiResponse } = require("../utils/apiResponse");
const { ApiError } = require("../utils/apiError");

const User = require("../models/User");

const {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashRefreshToken,
} = require("../services/auth.service");

const { generateOtp, setOtp, verifyOtp } = require("../services/otp.service");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../services/email.service");

function userPayload(user) {
  return {
    id: user._id,
    name: user.name,
    phone: user.phone || null,
    email: user.email,
    role: user.role,
    profilePhotoUrl: user.profilePhotoUrl || null,
  };
}

async function register(req, res, next) {
  try {
    const { name, phone, email, password, role } = req.validated.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new ApiError(409, "EMAIL_ALREADY_EXISTS", "Email already exists");
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name,
      phone: phone || null,
      email: email.toLowerCase(),
      password: passwordHash,
      role,
      isEmailVerified: false,
    });

    const otp = generateOtp();
    await setOtp({ key: `otp:${user.email}`, otp, ttlSeconds: 5 * 60 });
    await sendVerificationEmail({ to: user.email, name: user.name, otp });

    return res.json(apiResponse({ message: "OTP sent to email" }));
  } catch (err) {
    return next(err);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const { email, otp } = req.validated.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new ApiError(404, "USER_NOT_FOUND", "User not found");

    await verifyOtp({ key: `otp:${user.email}`, otp });

    user.isEmailVerified = true;

    const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
    const refreshToken = signRefreshToken({ sub: user._id.toString(), role: user.role });
    user.refreshToken = hashRefreshToken(refreshToken);

    await user.save();

    return res.json(
      apiResponse({
        data: {
          accessToken,
          refreshToken,
          user: userPayload(user),
        },
      })
    );
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.validated.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) throw new ApiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");
    if (!user.isEmailVerified) throw new ApiError(401, "EMAIL_NOT_VERIFIED", "Email not verified");

    const ok = await verifyPassword(password, user.password);
    if (!ok) throw new ApiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");

    const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
    const refreshToken = signRefreshToken({ sub: user._id.toString(), role: user.role });

    user.refreshToken = hashRefreshToken(refreshToken);
    await user.save();

    const safeUser = await User.findById(user._id).select("-password -refreshToken");

    return res.json(
      apiResponse({
        data: {
          accessToken,
          refreshToken,
          user: userPayload(safeUser),
        },
      })
    );
  } catch (err) {
    return next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.validated.body;
    const payload = verifyRefreshToken(refreshToken);

    const user = await User.findById(payload.sub).select("+refreshToken");
    if (!user) throw new ApiError(404, "USER_NOT_FOUND", "User not found");

    const hashedIncoming = hashRefreshToken(refreshToken);
    if (!user.refreshToken || user.refreshToken !== hashedIncoming) {
      throw new ApiError(401, "UNAUTHORIZED", "Invalid refresh token");
    }

    const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
    return res.json(apiResponse({ data: { accessToken } }));
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select("+refreshToken");
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    return res.json(apiResponse({ message: "Logged out" }));
  } catch (err) {
    return next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.validated.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json(apiResponse({ message: "Reset OTP sent" }));
    }

    const otp = generateOtp();
    await setOtp({ key: `reset:${user.email}`, otp, ttlSeconds: 10 * 60 });
    await sendPasswordResetEmail({ to: user.email, otp });

    return res.json(apiResponse({ message: "Reset OTP sent" }));
  } catch (err) {
    return next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { email, otp, newPassword } = req.validated.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) throw new ApiError(404, "USER_NOT_FOUND", "User not found");

    await verifyOtp({ key: `reset:${user.email}`, otp });

    user.password = await hashPassword(newPassword);
    await user.save();

    return res.json(apiResponse({ message: "Password updated" }));
  } catch (err) {
    return next(err);
  }
}

async function resendOtp(req, res, next) {
  try {
    const { email } = req.validated.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new ApiError(404, "USER_NOT_FOUND", "User not found");

    const otp = generateOtp();
    await setOtp({ key: `otp:${user.email}`, otp, ttlSeconds: 5 * 60 });
    await sendVerificationEmail({ to: user.email, name: user.name, otp });

    return res.json(apiResponse({ message: "OTP sent to email" }));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  register,
  verifyEmail,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  resendOtp,
};
