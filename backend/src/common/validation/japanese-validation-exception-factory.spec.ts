import 'reflect-metadata';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { plainToInstance, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
  MinLength,
  Validate,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  validate,
} from 'class-validator';
import { CreateTodoDto } from '../../todos/dto/create-todo.dto';
import { japaneseValidationExceptionFactory } from './japanese-validation-exception-factory';

enum SampleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

type TitleFixture = { title: unknown };

class NotEmptyFixture {
  @IsNotEmpty()
  title!: string;
}
class StringFixture {
  @IsString()
  title!: string;
}
class DateFixture {
  @IsDate()
  title!: Date;
}
class EnumFixture {
  @IsEnum(SampleStatus)
  title!: SampleStatus;
}
class EmailFixture {
  @IsEmail()
  title!: string;
}
class NumberFixture {
  @IsNumber()
  title!: number;
}
class IntFixture {
  @IsInt()
  title!: number;
}
class BooleanFixture {
  @IsBoolean()
  title!: boolean;
}
class ArrayFixture {
  @IsArray()
  title!: unknown[];
}
class MaxLengthFixture {
  @MaxLength(191)
  title!: string;
}
class MinLengthFixture {
  @MinLength(1)
  title!: string;
}
class LengthMinFixture {
  @Length(1)
  title!: string;
}
class LengthMaxFixture {
  @Length(0, 191)
  title!: string;
}
class MaxFixture {
  @Max(10)
  title!: number;
}
class MinFixture {
  @Min(1)
  title!: number;
}
class MaxLengthDigitPropertyFixture {
  @MaxLength(191)
  title1!: string;
}
class MaxDigitPropertyFixture {
  @Max(10)
  title1!: number;
}

@ValidatorConstraint({ name: 'isEven', async: false })
class IsEvenConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value === 'number' && value % 2 === 0;
  }
  defaultMessage(): string {
    return 'title must be even';
  }
}
class CustomConstraintFixture {
  @Validate(IsEvenConstraint)
  title!: number;
}

class MultiConstraintFixture {
  @IsNotEmpty()
  @IsString()
  title!: string;
}

class UnmappedFieldFixture {
  @IsNotEmpty()
  unknownField!: string;
}

class NestedChildFixture {
  @IsNotEmpty()
  child!: string;
}
class NestedParentFixture {
  @ValidateNested()
  @Type(() => NestedChildFixture)
  parent!: NestedChildFixture;
}

async function validateFixture(
  Fixture: new () => TitleFixture,
  value: unknown,
) {
  const dto = new Fixture();
  dto.title = value;
  return validate(dto as object);
}

describe('japaneseValidationExceptionFactory', () => {
  it('BadRequestExceptionを返す', async () => {
    const errors = await validateFixture(StringFixture, 123);

    const result = japaneseValidationExceptionFactory(errors);

    expect(result).toBeInstanceOf(BadRequestException);
    expect(result.getResponse()).toEqual({
      type: 'validation_error',
      statusCode: HttpStatus.BAD_REQUEST,
      message: {
        title: ['タイトルは文字列で入力してください'],
      },
      error: 'Bad Request',
    });
  });

  describe('フィールドラベルの変換', () => {
    it.each([
      {
        payload: { title: undefined, description: 'description' },
        expectedMessage: { title: ['タイトルは文字列で入力してください'] },
      },
      {
        payload: { title: 'title', description: undefined },
        expectedMessage: {
          description: ['説明は文字列で入力してください'],
        },
      },
      {
        payload: {
          title: 'title',
          description: 'description',
          due_date: 'not-a-date',
        },
        expectedMessage: {
          dueDate: ['期限日は有効な日付を入力してください'],
        },
      },
    ])(
      '$property はラベルを含んだメッセージに変換される',
      async ({ payload, expectedMessage }) => {
        const dto = plainToInstance(CreateTodoDto, payload);
        const errors = await validate(dto);

        const result = japaneseValidationExceptionFactory(errors);

        expect(result.getResponse()).toMatchObject({
          message: expectedMessage,
        });
      },
    );

    it('マッピングされていないプロパティはそのままの名前を使う', async () => {
      const dto = new UnmappedFieldFixture();
      dto.unknownField = '';
      const errors = await validate(dto);

      const result = japaneseValidationExceptionFactory(errors);

      expect(result.getResponse()).toMatchObject({
        message: { unknownField: ['unknownFieldを入力してください'] },
      });
    });
  });

  describe('制約ごとのメッセージ変換', () => {
    it.each([
      {
        Fixture: NotEmptyFixture,
        value: '',
        constraint: 'isNotEmpty',
        expected: 'タイトルを入力してください',
      },
      {
        Fixture: StringFixture,
        value: 123,
        constraint: 'isString',
        expected: 'タイトルは文字列で入力してください',
      },
      {
        Fixture: DateFixture,
        value: 'not-a-date',
        constraint: 'isDate',
        expected: 'タイトルは有効な日付を入力してください',
      },
      {
        Fixture: EnumFixture,
        value: 'unknown',
        constraint: 'isEnum',
        expected: 'タイトルの値が不正です',
      },
      {
        Fixture: EmailFixture,
        value: 'not-an-email',
        constraint: 'isEmail',
        expected: 'タイトルは有効なメールアドレスを入力してください',
      },
      {
        Fixture: NumberFixture,
        value: 'not-a-number',
        constraint: 'isNumber',
        expected: 'タイトルは数値で入力してください',
      },
      {
        Fixture: IntFixture,
        value: 1.5,
        constraint: 'isInt',
        expected: 'タイトルは整数で入力してください',
      },
      {
        Fixture: BooleanFixture,
        value: 'not-a-boolean',
        constraint: 'isBoolean',
        expected: 'タイトルはtrueかfalseで入力してください',
      },
      {
        Fixture: ArrayFixture,
        value: 'not-an-array',
        constraint: 'isArray',
        expected: 'タイトルは配列で入力してください',
      },
      {
        Fixture: MaxLengthFixture,
        value: 'a'.repeat(192),
        constraint: 'maxLength',
        expected: 'タイトルは191文字以内で入力してください',
      },
      {
        Fixture: MinLengthFixture,
        value: '',
        constraint: 'minLength',
        expected: 'タイトルは1文字以上で入力してください',
      },
      {
        Fixture: LengthMinFixture,
        value: '',
        constraint: 'isLength',
        expected: 'タイトルは1文字以上で入力してください',
      },
      {
        Fixture: LengthMaxFixture,
        value: 'a'.repeat(192),
        constraint: 'isLength',
        expected: 'タイトルは191文字以内で入力してください',
      },
      {
        Fixture: MaxFixture,
        value: 11,
        constraint: 'max',
        expected: 'タイトルは10以下で入力してください',
      },
      {
        Fixture: MinFixture,
        value: 0,
        constraint: 'min',
        expected: 'タイトルは1以上で入力してください',
      },
    ])(
      '$constraint は「$expected」に変換される',
      async ({ Fixture, value, constraint, expected }) => {
        const errors = await validateFixture(Fixture, value);
        expect(errors[0].constraints).toHaveProperty(constraint);

        const result = japaneseValidationExceptionFactory(errors);

        expect(result.getResponse()).toMatchObject({
          message: { title: [expected] },
        });
      },
    );

    it('未知の制約はdefaultMessageをそのまま使う', async () => {
      const errors = await validateFixture(CustomConstraintFixture, 3);
      expect(errors[0].constraints).toEqual({ isEven: 'title must be even' });

      const result = japaneseValidationExceptionFactory(errors);

      expect(result.getResponse()).toMatchObject({
        message: { title: ['title must be even'] },
      });
    });
  });

  it('同じフィールドに複数の制約違反がある場合、メッセージが配列にまとまる', async () => {
    const errors = await validateFixture(MultiConstraintFixture, undefined);
    expect(errors[0].constraints).toEqual({
      isString: 'title must be a string',
      isNotEmpty: 'title should not be empty',
    });

    const result = japaneseValidationExceptionFactory(errors);

    expect(result.getResponse()).toMatchObject({
      message: {
        title: [
          'タイトルは文字列で入力してください',
          'タイトルを入力してください',
        ],
      },
    });
  });

  it('複数フィールドのエラーはそれぞれのキーにまとまる', async () => {
    const dto = plainToInstance(CreateTodoDto, {
      title: undefined,
      description: undefined,
    });
    const errors = await validate(dto);

    const result = japaneseValidationExceptionFactory(errors);

    expect(result.getResponse()).toMatchObject({
      message: {
        title: ['タイトルは文字列で入力してください'],
        description: ['説明は文字列で入力してください'],
      },
    });
  });

  describe('プロパティ名に数字が含まれる場合', () => {
    it('maxLengthの制約値をプロパティ名の数字と誤認しない', async () => {
      const dto = new MaxLengthDigitPropertyFixture();
      dto.title1 = 'a'.repeat(192);
      const errors = await validate(dto);

      const result = japaneseValidationExceptionFactory(errors);

      expect(result.getResponse()).toMatchObject({
        message: { title1: ['title1は191文字以内で入力してください'] },
      });
    });

    it('maxの制約値をプロパティ名の数字と誤認しない', async () => {
      const dto = new MaxDigitPropertyFixture();
      dto.title1 = 11;
      const errors = await validate(dto);

      const result = japaneseValidationExceptionFactory(errors);

      expect(result.getResponse()).toMatchObject({
        message: { title1: ['title1は10以下で入力してください'] },
      });
    });
  });

  it('ネストしたエラーは親のプロパティ名を含んだキーになる', async () => {
    const dto = new NestedParentFixture();
    dto.parent = new NestedChildFixture();
    dto.parent.child = '';
    const errors = await validate(dto);

    const result = japaneseValidationExceptionFactory(errors);

    expect(result.getResponse()).toMatchObject({
      message: { 'parent.child': ['childを入力してください'] },
    });
  });

  // NestJSのValidationPipeはerrors.length > 0のときしかexceptionFactoryを呼ばないため、
  // 実際のリクエストフローでは空配列は渡らない。これは関数単体としての防御的なテスト。
  it('エラーが存在しない場合は空のメッセージオブジェクトを返す', async () => {
    const dto = plainToInstance(CreateTodoDto, {
      title: 'title',
      description: 'description',
    });
    const errors = await validate(dto);

    const result = japaneseValidationExceptionFactory(errors);

    expect(result.getResponse()).toMatchObject({
      message: {},
    });
  });
});
