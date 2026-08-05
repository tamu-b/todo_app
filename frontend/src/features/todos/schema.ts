import { z } from 'zod';
import { validationMessages } from '@/lib/validation-messages';
import { FIELD_LABELS } from './field-labels';
import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH } from './constants';

export const todoFormSchema = z.object({
  title: z
    .string({ message: validationMessages.isString(FIELD_LABELS.title) })
    .min(1, validationMessages.minLength(FIELD_LABELS.title, 1))
    .max(
      TITLE_MAX_LENGTH,
      validationMessages.maxLength(FIELD_LABELS.title, TITLE_MAX_LENGTH),
    ),
  description: z
    .string({
      message: validationMessages.isString(FIELD_LABELS.description),
    })
    .min(1, validationMessages.minLength(FIELD_LABELS.description, 1))
    .max(
      DESCRIPTION_MAX_LENGTH,
      validationMessages.maxLength(
        FIELD_LABELS.description,
        DESCRIPTION_MAX_LENGTH,
      ),
    ),
  dueDate: z.iso
    .date({ message: validationMessages.isDate(FIELD_LABELS.dueDate) })
    .nullable(),
});
