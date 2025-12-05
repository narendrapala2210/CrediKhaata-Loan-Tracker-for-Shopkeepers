import express, { Request, Response } from "express";
import { errorHandler } from "@credikhaata/shared";
import routes from "./routes/index.routes";
import cookieParser from "cookie-parser";

const app = express();

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use("/", routes); // auth routes handler

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: true,
    service: "Auth Service",
  });
});

app.use(errorHandler); // global error handler

export default app;
