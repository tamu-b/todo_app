import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import TodosLoading from './loading';

const meta = {
  component: TodosLoading,
} satisfies Meta<typeof TodosLoading>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const skeletons = canvasElement.querySelectorAll('.mantine-Skeleton-root');

    await expect(skeletons).toHaveLength(2);
  },
};
