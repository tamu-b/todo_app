import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import TodosError from './error';

const meta = {
  component: TodosError,
  args: {
    error: new Error('通信エラー'),
    reset: fn(),
  },
} satisfies Meta<typeof TodosError>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('Todoの読み込みに失敗しました'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(
        'バックエンドとの通信に失敗しました。時間をおいて再度お試しください。',
      ),
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: '再読み込み' }));
    await expect(args.reset).toHaveBeenCalled();
  },
};
