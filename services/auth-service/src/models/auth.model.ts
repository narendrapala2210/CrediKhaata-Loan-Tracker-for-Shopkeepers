import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export interface IAuth extends Document {
  email: string;
  password: string;
  is_active: boolean;
  is_verified: boolean;
  forgotPassword: {
    expiry: Date | null | undefined;
    token: string | null | undefined;
  };
  comparePassword(password: string): Promise<boolean>;
  getEmailVerifyToken: () => string;
  getAccessToken: () => string;
  getRefreshToken: () => string;
  getForgotToken: () => string;
}

const authSchema = new mongoose.Schema<IAuth>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    is_active: { type: Boolean, default: true },
    is_verified: { type: Boolean, default: false },
    forgotPassword: { expiry: { type: Date }, token: { type: String } },
  },
  {
    timestamps: true,
  }
);

authSchema.pre("save", async function () {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

authSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};
authSchema.methods.getEmailVerifyToken = function (): string {
  const secret = process.env.JWT_SECRET_EMAIL_VERIFY as string;
  const minutes = Number(process.env.EMAIL_VERIFY_EXPIRY_MIN || 20); // in minutes
  const expiresIn = minutes * 60; // seconds
  return jwt.sign({ id: this._id }, secret, { expiresIn });
};

authSchema.methods.getAccessToken = function (): string {
  const key = process.env.JWT_SECRET_ACCESS_KEY as string;
  const minutes = Number(process.env.ACCESS_TOKEN_EXPIRY_MIN || 15); // in minutes
  const expiresIn = minutes * 60; // seconds
  return jwt.sign({ id: this._id }, key, { expiresIn });
};

authSchema.methods.getRefreshToken = function (): string {
  const key = process.env.JWT_SECRET_REFRESH_KEY as string;
  const days = Number(process.env.REFRESH_TOKEN_EXPIRY_DAYS || 15); // in days
  const expiresIn = days * 24 * 60 * 60; // convert days → seconds
  return jwt.sign({ id: this._id }, key, { expiresIn });
};

authSchema.methods.getForgotToken = function (): string {
  const token = crypto.randomBytes(24).toString("hex");
  const expiry = new Date();
  const minutes = Number(process.env.FORGOT_PASSWORD_TOKEN_EXPIRY_MIN) || 20;
  expiry.setHours(expiry.getMinutes() + minutes); // expiry in minutes
  this.forgotPassword = { token: token, expiry: expiry };
  this.save();
  return token;
};

export default mongoose.model<IAuth>("Auth", authSchema);
