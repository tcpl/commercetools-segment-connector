import { Request } from 'express';
import ServiceError from '../errors/service.error';
import { decodeToJson } from '../utils/decoder.utils';

const HTTP_STATUS_BAD_REQUEST = 400;

export async function validateMessageBody(request: Request) {
  if (!request.body) {
    throw new ServiceError(
      HTTP_STATUS_BAD_REQUEST,
      'Bad request: No Pub/Sub message was received'
    );
  }

  if (!request.body.message) {
    throw new ServiceError(
      HTTP_STATUS_BAD_REQUEST,
      'Bad request: Wrong No Pub/Sub message format - Missing body message'
    );
  }

  if (!request.body.message.data) {
    throw new ServiceError(
      HTTP_STATUS_BAD_REQUEST,
      'Bad request: Wrong No Pub/Sub message format - Missing data in body message'
    );
  }

  const encodedMessageBody = request.body.message.data;

  return decodeToJson(encodedMessageBody);
}
