import {
  BadRequestException,
  HttpStatus,
  ValidationError,
} from '@nestjs/common';

export type ValidationErrorMessages = Record<string, string[]>;

const FIELD_LABELS: Record<string, string> = {
  title: 'タイトル',
  description: '説明',
  dueDate: '期限日',
};

type ConstraintTranslator = (
  property: string,
  defaultMessage: string,
) => string;

// $propertyがdefaultMessageの先頭に埋め込まれるため、property名に数字が
// 含まれていても誤って拾わないよう、末尾側の数値を制約値として抽出する。
function extractLastNumber(defaultMessage: string): string {
  return defaultMessage.match(/\d+(?!.*\d)/)?.[0] ?? '';
}

const CONSTRAINT_MESSAGES: Record<string, ConstraintTranslator> = {
  isNotEmpty: (property) => `${property}を入力してください`,
  isString: (property) => `${property}は文字列で入力してください`,
  isDate: (property) => `${property}は有効な日付を入力してください`,
  isEnum: (property) => `${property}の値が不正です`,
  isEmail: (property) => `${property}は有効なメールアドレスを入力してください`,
  isNumber: (property) => `${property}は数値で入力してください`,
  isInt: (property) => `${property}は整数で入力してください`,
  isBoolean: (property) => `${property}はtrueかfalseで入力してください`,
  isArray: (property) => `${property}は配列で入力してください`,
  maxLength: (property, defaultMessage) => {
    const max = extractLastNumber(defaultMessage);
    return `${property}は${max}文字以内で入力してください`;
  },
  minLength: (property, defaultMessage) => {
    const min = extractLastNumber(defaultMessage);
    return `${property}は${min}文字以上で入力してください`;
  },
  isLength: (property, defaultMessage) => {
    const num = extractLastNumber(defaultMessage);
    return defaultMessage.includes('longer than')
      ? `${property}は${num}文字以上で入力してください`
      : `${property}は${num}文字以内で入力してください`;
  },
  max: (property, defaultMessage) => {
    const max = extractLastNumber(defaultMessage);
    return `${property}は${max}以下で入力してください`;
  },
  min: (property, defaultMessage) => {
    const min = extractLastNumber(defaultMessage);
    return `${property}は${min}以上で入力してください`;
  },
};

function mergeMessages(
  target: ValidationErrorMessages,
  source: ValidationErrorMessages,
): void {
  for (const [field, msgs] of Object.entries(source)) {
    (target[field] ??= []).push(...msgs);
  }
}

function collectError(
  error: ValidationError,
  parentPath?: string,
): ValidationErrorMessages {
  const field = parentPath ? `${parentPath}.${error.property}` : error.property;
  const label = FIELD_LABELS[error.property] ?? error.property;
  const messages: ValidationErrorMessages = {};

  if (error.constraints) {
    for (const [key, defaultMessage] of Object.entries(error.constraints)) {
      const translate = CONSTRAINT_MESSAGES[key];
      const message = translate
        ? translate(label, defaultMessage)
        : defaultMessage;
      (messages[field] ??= []).push(message);
    }
  }

  if (error.children) {
    for (const child of error.children) {
      mergeMessages(messages, collectError(child, field));
    }
  }

  return messages;
}

function collectErrors(errors: ValidationError[]): ValidationErrorMessages {
  const messages: ValidationErrorMessages = {};
  errors.forEach((error) => mergeMessages(messages, collectError(error)));
  return messages;
}

export function japaneseValidationExceptionFactory(
  errors: ValidationError[],
): BadRequestException {
  return new BadRequestException({
    type: 'validation_error',
    statusCode: HttpStatus.BAD_REQUEST,
    message: collectErrors(errors),
    error: 'Bad Request',
  });
}
