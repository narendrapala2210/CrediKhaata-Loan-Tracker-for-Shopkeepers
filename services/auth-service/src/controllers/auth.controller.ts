import { Request, Response, NextFunction } from "express";
import { CustomError } from "@credikhaata/shared";
import User from "../models/auth.model";
import handleCookies from "../utils/cookies";
import jwt from "jsonwebtoken";

const register = async (req: Request, res: Response, next: NextFunction) => {
  const exist = await User.findOne({ email: req.body.email });
  if (exist) {
    return next(new CustomError("User already exists", 400));
  }
  const user = await User.create(req.body);

  // TODO: send verification email logic can be added here
  //

  const { password, ...userData } = (
    Array.isArray(user) ? user[0] : user
  ).toObject();

  res.status(201).json({
    status: "success",
    message: "User registered successfully",
    data: {
      user: userData,
    },
  });
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findOne({ email: req.body.email }).select(
    "+password"
  );
  if (!user) {
    return next(new CustomError("User details not found", 404));
  }
  const isPasswordValid = await user.comparePassword(req.body.password);
  if (!isPasswordValid) {
    return next(new CustomError("invalid email and password", 400));
  }

  if (!user.is_verified) {
    // TODO: Resend verification email logic can be added here
    console.log(user.getEmailVerifyToken());
    return next(new CustomError("User is not verified", 400));
  }

  handleCookies(res, user.getRefreshToken()); // set refresh token in cookies
  res.json({
    status: "success",
    message: "User logged in successfully",
    data: {
      access_token: user.getAccessToken(),
      user: user,
    },
  });
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.json({
    status: "success",
    message: "User logout in successfully",
  });
};

const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() });
  if (!user) {
    return next(new CustomError("user details not found", 404));
  }

  try {
    const token = user.getForgotToken();
    const url = `${process.env.CLIENT_URL}/reset-password`;
    const link = url + `?token=${token}`;
    console.log(link);
    // TODO: send email logic to be implemented here

    res.json({
      status: "success",
      message: "successfully send reset link to email id",
    });
  } catch (error: unknown) {
    user.forgotPassword = { expiry: null, token: null };
    await user.save();
    if (error instanceof Error) {
      next(new CustomError(error.message, 500));
    } else {
      next(new CustomError("Unexpected error", 500));
    }
  }
};

const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await User.findOne({
    "forgotPassword.expiry": { $gt: Date.now() },
    "forgotPassword.token": req.body.reset_token,
  });

  if (!user) {
    return next(new CustomError("User details Not found", 404));
  }

  user.password = req.body.password;
  user.forgotPassword = { token: null, expiry: null };
  await user.save();

  // TODO: send confirmation email logic can be added here

  res.json({
    status: "success",
    message: "Password reset successfully",
  });
};

const emailVerify = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.body.verify_token as string;
  if (!token) {
    return next(new CustomError("Verification token missing", 400));
  }

  // decode token
  const secret = process.env.JWT_SECRET_EMAIL_VERIFY as string;
  const payload = jwt.verify(token, secret) as { id: string };

  if (!payload || !payload.id) {
    return next(new CustomError("Invalid or expired token", 400));
  }

  // Look up user
  const user = await User.findById(payload.id);

  if (!user) {
    return next(new CustomError("User not found", 404));
  }

  user.is_verified = true;
  await user.save();

  // TODO: send confirmation email logic can be added here

  res.json({
    status: "success",
    message: "Email verified successfully",
  });
};

export default {
  register,
  emailVerify,
  login,
  logout,
  forgotPassword,
  resetPassword,
};
