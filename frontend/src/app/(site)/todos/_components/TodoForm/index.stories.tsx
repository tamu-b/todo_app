import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { getRouter } from '@storybook/nextjs-vite/navigation.mock';
import { http, HttpResponse } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { BACKEND_URL } from '@/constants/app';
import { FIELD_LABELS } from '@/features/todos/field-labels';
import { Todo } from '@/features/todos/types';
import { validationMessages } from '@/lib/validation-messages';
import { TodoForm } from './index';

const todo: Readonly<Todo> = {
  id: 1,
  title: '買い物に行く',
  description: '牛乳と卵を買う',
  dueDate: '2026-08-20',
};

const meta = {
  component: TodoForm,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof TodoForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Create: Story = {
  args: {
    type: 'create',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('textbox', { name: FIELD_LABELS.title }),
    ).toHaveValue('');
    await expect(
      canvas.getByRole('textbox', { name: FIELD_LABELS.description }),
    ).toHaveValue('');
    await expect(
      canvas.getByRole('button', { name: '作成' }),
    ).toBeInTheDocument();
  },
};

export const Edit: Story = {
  args: {
    type: 'update',
    todo,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('textbox', { name: FIELD_LABELS.title }),
    ).toHaveValue(todo.title);
    await expect(
      canvas.getByRole('textbox', { name: FIELD_LABELS.description }),
    ).toHaveValue(todo.description);
    await expect(
      canvas.getByRole('textbox', { name: FIELD_LABELS.dueDate }),
    ).toHaveValue(todo.dueDate);
    await expect(
      canvas.getByRole('button', { name: '更新' }),
    ).toBeInTheDocument();
  },
};

export const ValidationError: Story = {
  args: {
    type: 'create',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: '作成' }));

    await expect(
      canvas.getByText(validationMessages.minLength(FIELD_LABELS.title, 1)),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(
        validationMessages.minLength(FIELD_LABELS.description, 1),
      ),
    ).toBeInTheDocument();
  },
};

export const CreateSuccess: Story = {
  args: {
    type: 'create',
  },
  parameters: {
    msw: {
      handlers: [
        http.post(`${BACKEND_URL}/todos`, () => HttpResponse.json(todo)),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(
      canvas.getByRole('textbox', { name: FIELD_LABELS.title }),
      todo.title,
    );
    await userEvent.type(
      canvas.getByRole('textbox', { name: FIELD_LABELS.description }),
      todo.description,
    );
    await userEvent.click(canvas.getByRole('button', { name: '作成' }));

    await waitFor(() =>
      expect(getRouter().push).toHaveBeenCalledWith(`/todos/${todo.id}`),
    );
  },
};
