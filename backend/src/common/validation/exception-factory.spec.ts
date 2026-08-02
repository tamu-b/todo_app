import { BadRequestException, HttpStatus } from '@nestjs/common';
import type { ValidationError } from '@nestjs/common';
import { exceptionFactory, ValidationMessageNode } from './exception-factory';

describe('exceptionFactory', () => {
  it('BadRequestExceptionを返す', () => {
    const result = exceptionFactory([]);

    expect(result).toBeInstanceOf(BadRequestException);
    expect(result.getStatus()).toBe(HttpStatus.BAD_REQUEST);
  });

  const cases: {
    label: string;
    errors: ValidationError[];
    expectedMessage: Record<string, ValidationMessageNode>;
  }[] = [
    {
      label:
        '1つのプロパティに1つの制約違反がある場合、プロパティをキーにしたmessagesを返す',
      errors: [
        {
          property: 'title',
          constraints: { minLength: 'タイトルは1文字以上で入力してください' },
        },
      ],
      expectedMessage: {
        title: { messages: ['タイトルは1文字以上で入力してください'] },
      },
    },
    {
      label:
        '1つのプロパティに複数の制約違反がある場合、messagesを配列にまとめる',
      errors: [
        {
          property: 'title',
          constraints: {
            minLength: 'タイトルは1文字以上で入力してください',
            maxLength: 'タイトルは191文字以内で入力してください',
          },
        },
      ],
      expectedMessage: {
        title: {
          messages: [
            'タイトルは1文字以上で入力してください',
            'タイトルは191文字以内で入力してください',
          ],
        },
      },
    },
    {
      label: '複数のプロパティにエラーがある場合、それぞれのキーにまとめる',
      errors: [
        {
          property: 'title',
          constraints: { isString: 'タイトルは文字列で入力してください' },
        },
        {
          property: 'description',
          constraints: { isString: '説明は文字列で入力してください' },
        },
      ],
      expectedMessage: {
        title: { messages: ['タイトルは文字列で入力してください'] },
        description: { messages: ['説明は文字列で入力してください'] },
      },
    },
    {
      label:
        'ネストしたオブジェクトのエラーはchildrenに親のプロパティ名を保ったまま格納される',
      errors: [
        {
          property: 'hoge',
          children: [
            {
              property: 'fuga',
              constraints: { isString: 'fugaは文字列で入力してください' },
            },
          ],
        },
      ],
      expectedMessage: {
        hoge: {
          messages: [],
          children: {
            fuga: { messages: ['fugaは文字列で入力してください'] },
          },
        },
      },
    },
  ];
  it.each(cases)('$label', ({ errors, expectedMessage }) => {
    const result = exceptionFactory(errors);

    expect(result.getResponse()).toEqual({
      type: 'validation_error',
      statusCode: HttpStatus.BAD_REQUEST,
      message: expectedMessage,
      error: 'Bad Request',
    });
  });
});
