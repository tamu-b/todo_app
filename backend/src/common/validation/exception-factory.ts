import {
  BadRequestException,
  HttpStatus,
  ValidationError,
} from '@nestjs/common';

export type ValidationMessageNode = {
  messages: string[];
  children?: Record<string, ValidationMessageNode>;
};

function buildNode(error: ValidationError): ValidationMessageNode {
  const node: ValidationMessageNode = {
    messages: error.constraints ? Object.values(error.constraints) : [],
  };

  if (error.children && error.children.length > 0) {
    node.children = buildMessages(error.children);
  }

  return node;
}

function buildMessages(
  errors: ValidationError[],
): Record<string, ValidationMessageNode> {
  const result: Record<string, ValidationMessageNode> = {};

  for (const error of errors) {
    const node = buildNode(error);
    const existing = result[error.property];

    if (!existing) {
      result[error.property] = node;
      continue;
    }

    existing.messages.push(...node.messages);
    if (node.children) {
      existing.children = { ...existing.children, ...node.children };
    }
  }

  return result;
}

export function exceptionFactory(
  errors: ValidationError[],
): BadRequestException {
  const message = buildMessages(errors);

  return new BadRequestException({
    type: 'validation_error',
    statusCode: HttpStatus.BAD_REQUEST,
    message,
    error: 'Bad Request',
  });
}
