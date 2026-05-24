import { HttpException, HttpStatus } from '@nestjs/common';

export class SuccessResponse<T> {
  message: string;
  statusCode: number;
  error: null;
  data: T;
  total?: number;
  page?: number;
  limit?: number;
}

export class ErrorResponse {
  message: string[];
  statusCode: number;
  error: string;
  data: null;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export class CustomException extends HttpException {
  constructor(
    msg: string = 'Something went wrong',
    error: string = 'Internal Server Error',
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    const errorResponse = {
      message: [msg],
      error: error,
      statusCode: statusCode,
      data: null,
    };

    super(errorResponse, statusCode);
  }
}
