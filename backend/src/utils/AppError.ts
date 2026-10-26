class AppError extends Error {
  statusCode: number;
  status: "fail" | "error";
  data?: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.data = data;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
