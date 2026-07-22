import { BadRequestException, ValidationError } from '@nestjs/common';

type ConstraintTranslator = (
  property: string,
  defaultMessage: string,
) => string;

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
    const max = defaultMessage.match(/\d+/)?.[0] ?? '';
    return `${property}は${max}文字以内で入力してください`;
  },
  minLength: (property, defaultMessage) => {
    const min = defaultMessage.match(/\d+/)?.[0] ?? '';
    return `${property}は${min}文字以上で入力してください`;
  },
  isLength: (property, defaultMessage) => {
    const num = defaultMessage.match(/\d+/)?.[0] ?? '';
    return defaultMessage.includes('longer than')
      ? `${property}は${num}文字以上で入力してください`
      : `${property}は${num}文字以内で入力してください`;
  },
  max: (property, defaultMessage) => {
    const max = defaultMessage.match(/\d+/)?.[0] ?? '';
    return `${property}は${max}以下で入力してください`;
  },
  min: (property, defaultMessage) => {
    const min = defaultMessage.match(/\d+/)?.[0] ?? '';
    return `${property}は${min}以上で入力してください`;
  },
};

function translateError(error: ValidationError): string[] {
  const messages: string[] = [];

  if (error.constraints) {
    for (const [key, defaultMessage] of Object.entries(error.constraints)) {
      const translate = CONSTRAINT_MESSAGES[key];
      messages.push(
        translate ? translate(error.property, defaultMessage) : defaultMessage,
      );
    }
  }

  if (error.children) {
    for (const child of error.children) {
      messages.push(...translateError(child));
    }
  }

  return messages;
}

export function japaneseValidationExceptionFactory(
  errors: ValidationError[],
): BadRequestException {
  const messages = errors.flatMap(translateError);
  return new BadRequestException(messages);
}
