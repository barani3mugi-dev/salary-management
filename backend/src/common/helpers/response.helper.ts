import { HttpStatus } from '@nestjs/common';
import { SuccessResponse } from '../../utils/http_response';

export function successResponse<T>(
  data: T,
  message: string,
  statusCode: number = HttpStatus.OK,
): SuccessResponse<T> {
  return {
    statusCode,
    message,
    error: null,
    data,
  };
}