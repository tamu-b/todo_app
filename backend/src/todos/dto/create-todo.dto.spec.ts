import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTodoDto } from './create-todo.dto';

describe('CreateTodoDto', () => {
  const validPayload = {
    title: 'title',
    description: 'description',
    due_date: '2026-01-01',
  };

  describe('有効な入力の場合', () => {
    it.each([
      {
        label: 'due_dateを指定した場合、dueDateにマッピングされる',
        payload: validPayload,
        expected: {
          title: 'title',
          description: 'description',
          dueDate: new Date('2026-01-01'),
        },
      },
      {
        label: 'due_dateがundefinedの場合、dueDateはundefinedになる',
        payload: { title: 'title', description: 'description' },
        expected: {
          title: 'title',
          description: 'description',
          dueDate: undefined,
        },
      },
      {
        label: 'due_dateがnullの場合、dueDateはundefinedになる',
        payload: { title: 'title', description: 'description', due_date: null },
        expected: {
          title: 'title',
          description: 'description',
          dueDate: undefined,
        },
      },
      {
        label: 'titleが1文字でも通過する',
        payload: { ...validPayload, title: 'a' },
        expected: {
          title: 'a',
          description: 'description',
          dueDate: new Date('2026-01-01'),
        },
      },
      {
        label: 'titleが191文字でも通過する',
        payload: { ...validPayload, title: 'a'.repeat(191) },
        expected: {
          title: 'a'.repeat(191),
          description: 'description',
          dueDate: new Date('2026-01-01'),
        },
      },
      {
        label: 'titleが日本語の191文字でも通過する',
        payload: { ...validPayload, title: 'あ'.repeat(191) },
        expected: {
          title: 'あ'.repeat(191),
          description: 'description',
          dueDate: new Date('2026-01-01'),
        },
      },
      {
        label: 'descriptionが1文字でも通過する',
        payload: { ...validPayload, description: 'a' },
        expected: {
          title: 'title',
          description: 'a',
          dueDate: new Date('2026-01-01'),
        },
      },
      {
        label: 'descriptionが191文字でも通過する',
        payload: { ...validPayload, description: 'a'.repeat(191) },
        expected: {
          title: 'title',
          description: 'a'.repeat(191),
          dueDate: new Date('2026-01-01'),
        },
      },
      {
        label: 'descriptionが日本語の191文字でも通過する',
        payload: { ...validPayload, description: 'あ'.repeat(191) },
        expected: {
          title: 'title',
          description: 'あ'.repeat(191),
          dueDate: new Date('2026-01-01'),
        },
      },
    ])('$label', async ({ payload, expected }) => {
      const dto = plainToInstance(CreateTodoDto, payload);

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto).toEqual(expected);
    });
  });

  describe('無効な入力の場合', () => {
    it.each([
      {
        label: 'titleがundefinedの場合は拒否する',
        payload: {
          ...validPayload,
          title: undefined,
        },
        errorProperty: 'title',
        errorConstraint: 'isString',
      },
      {
        label: 'titleがnullの場合は拒否する',
        payload: {
          ...validPayload,
          title: null,
        },
        errorProperty: 'title',
        errorConstraint: 'isString',
      },
      {
        label: 'titleが空文字の場合は拒否する',
        payload: {
          ...validPayload,
          title: '',
        },
        errorProperty: 'title',
        errorConstraint: 'isLength',
      },
      {
        label: 'titleが191文字を超える文字列の場合は拒否する',
        payload: {
          ...validPayload,
          title: 'a'.repeat(192),
        },
        errorProperty: 'title',
        errorConstraint: 'isLength',
      },
      {
        label: 'descriptionがundefinedの場合は拒否する',
        payload: {
          ...validPayload,
          description: undefined,
        },
        errorProperty: 'description',
        errorConstraint: 'isString',
      },
      {
        label: 'descriptionがnullの場合は拒否する',
        payload: {
          ...validPayload,
          description: null,
        },
        errorProperty: 'description',
        errorConstraint: 'isString',
      },
      {
        label: 'descriptionが空文字の場合は拒否する',
        payload: {
          ...validPayload,
          description: '',
        },
        errorProperty: 'description',
        errorConstraint: 'isLength',
      },
      {
        label: 'descriptionが191文字を超える文字列の場合は拒否する',
        payload: {
          ...validPayload,
          description: 'a'.repeat(192),
        },
        errorProperty: 'description',
        errorConstraint: 'isLength',
      },
      {
        label: 'due_dateが不正な日付文字列の場合は拒否する',
        payload: {
          ...validPayload,
          due_date: 'not-a-date',
        },
        errorProperty: 'dueDate',
        errorConstraint: 'isDate',
      },
    ])('$label', async ({ payload, errorProperty, errorConstraint }) => {
      const dto = plainToInstance(CreateTodoDto, payload);

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe(errorProperty);
      expect(errors[0].constraints).toEqual({
        [errorConstraint]: expect.any(String) as string,
      });
    });
  });
});
