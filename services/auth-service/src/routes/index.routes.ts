import { Router } from "express";
import routes from "./auth.routes";

const rr = Router();

rr.use("/", routes); // auth routes
// rr.use("/", routes); // token routes

export default rr;
