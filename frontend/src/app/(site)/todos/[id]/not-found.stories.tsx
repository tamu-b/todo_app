import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import TodoNotFound from './not-found';

const meta = {
  component: TodoNotFound,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof TodoNotFound>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Todoが見つかりません')).toBeInTheDocument();
    await expect(
      canvas.getByText(
        '指定されたTodoは存在しないか、削除された可能性があります。',
      ),
    ).toBeInTheDocument();

    const link = canvas.getByRole('link', { name: '一覧に戻る' });
    await expect(link).toHaveAttribute('href', '/todos');
  },
};
