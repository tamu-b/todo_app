import { Notifications, notifications } from '@mantine/notifications';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { getRouter } from '@storybook/nextjs-vite/navigation.mock';
import { http, HttpResponse } from 'msw';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { BACKEND_URL } from '@/constants/app';
import { Todo } from '@/features/todos/types';
import { DeleteTodoButton } from './index';

const todo: Readonly<Todo> = {
  id: 1,
  title: '買い物に行く',
  description: '牛乳と卵を買う',
  dueDate: '2026-08-20',
};

const meta = {
  component: DeleteTodoButton,
  args: {
    todo,
  },
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => (
      <>
        <Notifications />
        <Story />
      </>
    ),
  ],
} satisfies Meta<typeof DeleteTodoButton>;

export default meta;

type Story = StoryObj<typeof meta>;

const openModal = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);

  await userEvent.click(canvas.getByRole('button', { name: '削除' }));
  await screen.findByRole('heading', { name: 'Todoの削除' });
};

export const Default: Story = {
  play: async ({ canvasElement }) => {
    notifications.clean();
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('button', { name: '削除' }),
    ).toBeInTheDocument();
  },
};

export const Opened: Story = {
  play: async ({ canvasElement }) => {
    notifications.clean();
    await openModal(canvasElement);

    await expect(
      screen.getByText(
        `「${todo.title}」を削除しますか？この操作は取り消せません。`,
      ),
    ).toBeInTheDocument();
    await expect(
      screen.getByRole('button', { name: 'キャンセル' }),
    ).toBeInTheDocument();
    await expect(
      screen.getByRole('button', { name: '削除する' }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'キャンセル' }));
    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: 'Todoの削除' }),
      ).not.toBeInTheDocument(),
    );
  },
};

export const Cancel: Story = {
  play: async ({ canvasElement }) => {
    notifications.clean();
    await openModal(canvasElement);
    await userEvent.click(screen.getByRole('button', { name: 'キャンセル' }));

    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: 'Todoの削除' }),
      ).not.toBeInTheDocument(),
    );
  },
};

export const DeleteSuccess: Story = {
  parameters: {
    msw: {
      handlers: [
        http.delete(
          `${BACKEND_URL}/todos/${todo.id}`,
          () => new HttpResponse(null, { status: 200 }),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    notifications.clean();
    await openModal(canvasElement);
    await userEvent.click(screen.getByRole('button', { name: '削除する' }));

    await expect(
      screen.findByText('Todoを削除しました'),
    ).resolves.toBeInTheDocument();
    await waitFor(() =>
      expect(getRouter().push).toHaveBeenCalledWith('/todos'),
    );
  },
};

export const DeleteNotFound: Story = {
  parameters: {
    msw: {
      handlers: [
        http.delete(`${BACKEND_URL}/todos/${todo.id}`, () =>
          HttpResponse.json(
            {
              statusCode: 404,
              message: 'Not Found',
              error: 'Not Found',
            },
            { status: 404 },
          ),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    notifications.clean();
    await openModal(canvasElement);
    await userEvent.click(screen.getByRole('button', { name: '削除する' }));

    await expect(
      screen.findByText('対象のTodoが見つかりませんでした'),
    ).resolves.toBeInTheDocument();
    await expect(
      screen.getByRole('heading', { name: 'Todoの削除' }),
    ).toBeInTheDocument();
  },
};

export const DeleteError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.delete(`${BACKEND_URL}/todos/${todo.id}`, () =>
          HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 },
          ),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    notifications.clean();
    await openModal(canvasElement);
    await userEvent.click(screen.getByRole('button', { name: '削除する' }));

    await expect(
      screen.findByText('削除に失敗しました。時間をおいて再度お試しください。'),
    ).resolves.toBeInTheDocument();
  },
};
