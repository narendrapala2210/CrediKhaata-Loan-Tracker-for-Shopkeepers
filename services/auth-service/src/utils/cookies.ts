import { Response } from "express";
export default function handleCookies(res: Response, token: string) {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRE_DAYS) || 15;
  res.cookie("refresh_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: days * 24 * 60 * 60 * 1000,
  });
}
