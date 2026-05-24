import { HttpStatus } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { CustomException } from '../../utils/http_response';

export function handleServiceError(
  error: unknown,
  logger: PinoLogger,
  context: Record<string, unknown>,
  message: string,
): never {
  if (error instanceof CustomException) throw error;
  logger.error({ err: error, ...context }, message);
  throw new CustomException(
    message,
    'Internal Server Error',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}