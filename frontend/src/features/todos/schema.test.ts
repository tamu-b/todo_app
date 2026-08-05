import { describe, expect, it } from 'vitest';
import { validationMessages } from '@/lib/validation-messages';
import { FIELD_LABELS } from './field-labels';
import { todoFormSchema } from './schema';

describe('todoFormSchema', () => {
  const validPayload = {
    title: 'title',
    description: 'description',
    dueDate: '2026-01-01',
  };

  describe('有効な入力の場合', () => {
    it.each([
      {
        label: 'titleが1文字でも通過する',
        payload: { ...validPayload, title: 'a' },
      },
      {
        label: 'titleが191文字でも通過する',
        payload: { ...validPayload, title: 'a'.repeat(191) },
      },
      {
        label: 'titleが日本語の191文字でも通過する',
        payload: { ...validPayload, title: 'あ'.repeat(191) },
      },
      {
        label: 'descriptionが1文字でも通過する',
        payload: { ...validPayload, description: 'a' },
      },
      {
        label: 'descriptionが191文字でも通過する',
        payload: { ...validPayload, description: 'a'.repeat(191) },
      },
      {
        label: 'descriptionが日本語の191文字でも通過する',
        payload: { ...validPayload, description: 'あ'.repeat(191) },
      },
      {
        label: 'dueDateがnullでも通過する',
        payload: { ...validPayload, dueDate: null },
      },
    ])('$label', ({ payload }) => {
      const result = todoFormSchema.safeParse(payload);

      expect(result.success).toBe(true);
    });
  });

  describe('無効な入力の場合', () => {
    it.each([
      {
        label: 'titleがundefinedの場合は拒否する',
        payload: { ...validPayload, title: undefined },
        errorPath: ['title'],
        errorMessage: validationMessages.isString(FIELD_LABELS.title),
      },
      {
        label: 'titleがnullの場合は拒否する',
        payload: { ...validPayload, title: null },
        errorPath: ['title'],
        errorMessage: validationMessages.isString(FIELD_LABELS.title),
      },
      {
        label: 'titleが空文字の場合は拒否する',
        payload: { ...validPayload, title: '' },
        errorPath: ['title'],
        errorMessage: validationMessages.minLength(FIELD_LABELS.title, 1),
      },
      {
        label: 'titleが191文字を超える文字列の場合は拒否する',
        payload: { ...validPayload, title: 'a'.repeat(192) },
        errorPath: ['title'],
        errorMessage: validationMessages.maxLength(FIELD_LABELS.title, 191),
      },
      {
        label: 'descriptionがundefinedの場合は拒否する',
        payload: { ...validPayload, description: undefined },
        errorPath: ['description'],
        errorMessage: validationMessages.isString(FIELD_LABELS.description),
      },
      {
        label: 'descriptionがnullの場合は拒否する',
        payload: { ...validPayload, description: null },
        errorPath: ['description'],
        errorMessage: validationMessages.isString(FIELD_LABELS.description),
      },
      {
        label: 'descriptionが空文字の場合は拒否する',
        payload: { ...validPayload, description: '' },
        errorPath: ['description'],
        errorMessage: validationMessages.minLength(FIELD_LABELS.description, 1),
      },
      {
        label: 'descriptionが191文字を超える文字列の場合は拒否する',
        payload: { ...validPayload, description: 'a'.repeat(192) },
        errorPath: ['description'],
        errorMessage: validationMessages.maxLength(
          FIELD_LABELS.description,
          191,
        ),
      },
      {
        label: 'dueDateが不正な日付文字列の場合は拒否する',
        payload: { ...validPayload, dueDate: 'not-a-date' },
        errorPath: ['dueDate'],
        errorMessage: validationMessages.isDate(FIELD_LABELS.dueDate),
      },
      {
        // フォームは常に文字列かnullを送るため、backendのIsOptionalとは異なりundefinedは許可しない
        label: 'dueDateがundefinedの場合は拒否する',
        payload: { ...validPayload, dueDate: undefined },
        errorPath: ['dueDate'],
        errorMessage: validationMessages.isDate(FIELD_LABELS.dueDate),
      },
    ])('$label', ({ payload, errorPath, errorMessage }) => {
      const result = todoFormSchema.safeParse(payload);

      expect(result.success).toBe(false);
      if (result.success) {
        return;
      }
      expect(result.error.issues).toHaveLength(1);
      expect(result.error.issues[0].path).toEqual(errorPath);
      expect(result.error.issues[0].message).toBe(errorMessage);
    });
  });
});
