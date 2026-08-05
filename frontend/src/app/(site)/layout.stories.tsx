import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import Layout from './layout';

const meta = {
  component: Layout,
  args: {
    children: <div>Page Content</div>,
  },
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof Layout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Page Content')).toBeInTheDocument();
    await expect(canvas.getByText('Logo')).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('.mantine-Burger-root'),
    ).toBeInTheDocument();

    const link = canvas.getByRole('link', { name: 'Todo一覧' });
    await expect(link).toHaveAttribute('href', '/todos');
  },
};
