class ServiceError extends Error {
  statusCode: number | string;
  message: string;

  constructor(statusCode: number | string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
  }
}

export default ServiceError;
