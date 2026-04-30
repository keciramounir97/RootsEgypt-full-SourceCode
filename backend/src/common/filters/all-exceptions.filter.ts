import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isProduction = process.env.NODE_ENV === "production";

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : "Internal server error";

    // Extract message string if object
    const errorMessage =
      typeof message === "object" &&
      (message as Record<string, unknown>)?.message
        ? (message as Record<string, unknown>).message
        : message;

    const requestId = (request as Request & { id?: string }).id || "-";

    // Always log the real error
    if (!(exception instanceof HttpException) && exception instanceof Error) {
      this.logger.error(
        `[${requestId}] UNHANDLED ${exception.constructor?.name || "Error"}: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error(
        `[${requestId}] HTTP ${status} - ${Array.isArray(errorMessage) ? errorMessage[0] : errorMessage}`,
      );
    }

    if (requestId !== "-") {
      response.setHeader("X-Request-Id", requestId);
    }

    // In production, never leak internal error messages for 5xx errors
    const safeMessage =
      isProduction && status >= 500
        ? "Internal server error"
        : Array.isArray(errorMessage)
          ? errorMessage[0]
          : errorMessage;

    const realErrorMessage =
      !(exception instanceof HttpException) && exception instanceof Error
        ? exception.message
        : undefined;

    // In production, omit error details for 5xx
    const errorPayload =
      isProduction && status >= 500
        ? { message: "Internal server error" }
        : typeof message === "object"
          ? message
          : { message: realErrorMessage ?? message };

    response.status(status).json({
      statusCode: status,
      message: safeMessage,
      data: null,
      error: errorPayload,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(requestId !== "-" && { requestId }),
    });
  }
}
