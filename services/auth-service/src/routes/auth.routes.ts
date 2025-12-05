import { Router } from "express";
import controller from "../controllers/auth.controller";

const rr = Router();

rr.post("/register", controller.register);
rr.post("/login", controller.login);
rr.get("/logout", controller.logout);
rr.post("/forgot-password", controller.forgotPassword);
rr.patch("/reset-password", controller.resetPassword);
rr.patch("/verify-email", controller.emailVerify);

export default rr;
