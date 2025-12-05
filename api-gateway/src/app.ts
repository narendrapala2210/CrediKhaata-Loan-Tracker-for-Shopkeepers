import express, { Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import routes from "./routes";

const app = express();

// middlewares
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/v1", routes); // router handler

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: true,
    service: "API Gateway",
  });
});

// app.use("") // not found
// app.use() // global error handler

export default app;
