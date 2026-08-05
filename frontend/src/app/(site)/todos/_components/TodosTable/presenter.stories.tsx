import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { FIELD_LABELS } from '@/features/todos/field-labels';
import { Todo } from '@/features/todos/types';
import { TodosTablePresenter } from './presenter';

const todos: ReadonlyArray<Readonly<Todo>> = [
  {
    id: 1,
    title: '買い物に行く',
    description: '牛乳と卵を買う',
    dueDate: '2026-08-10',
  },
  {
    id: 2,
    title: 'レポートを提出する',
    description: '月次レポートを作成して提出する',
    dueDate: null,
  },
  {
    id: 3,
    title: 'ミーティングの資料を準備するとても長いタイトルの場合の表示確認',
    description: '資料作成',
    dueDate: '2026-08-15',
  },
];

const meta = {
  component: TodosTablePresenter,
  args: {
    todos,
  },
} satisfies Meta<typeof TodosTablePresenter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('ID')).toBeInTheDocument();
    await expect(canvas.getByText(FIELD_LABELS.title)).toBeInTheDocument();
    await expect(canvas.getByText(FIELD_LABELS.dueDate)).toBeInTheDocument();

    for (const todo of todos) {
      const row = canvas.getByText(todo.title).closest('tr');
      if (!row) {
        throw new Error(`row not found for todo: ${todo.title}`);
      }
      const rowCanvas = within(row);

      await expect(rowCanvas.getByText(String(todo.id))).toBeInTheDocument();
      await expect(
        rowCanvas.getByText(todo.dueDate ?? '-'),
      ).toBeInTheDocument();

      const detailLink = rowCanvas.getByRole('link', { name: '詳細' });
      await expect(detailLink).toHaveAttribute('href', `/todos/${todo.id}`);
    }
  },
};

export const Empty: Story = {
  args: {
    todos: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('ID')).toBeInTheDocument();
    await expect(
      canvas.queryByRole('link', { name: '詳細' }),
    ).not.toBeInTheDocument();
  },
};
