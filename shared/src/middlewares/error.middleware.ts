import { Request, Response, NextFunction } from "express";

export class CustomError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode.toString().startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = err as CustomError;

  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  error.message = error.message || "Something went wrong!";

  // TODO: Prod errors
  // TODO: Dev errors

  console.error("UNEXPECTED ERROR 💥", error.message as string);

  return res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
};
