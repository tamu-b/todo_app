import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { LinkButton } from './index';

const meta = {
  component: LinkButton,
  args: {
    href: '/todos',
    children: 'Link Button',
  },
} satisfies Meta<typeof LinkButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const link = canvas.getByRole('link', { name: 'Link Button' });

    await expect(link.tagName).toBe('A');
    await expect(link).toHaveAttribute('href', args.href);
  },
};

export const Filled: Story = {
  args: {
    variant: 'filled',
    color: 'blue',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    color: 'blue',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const button = canvas
      .getByText('Link Button')
      .closest('.mantine-Button-root');
    if (!button) {
      throw new Error('button not found');
    }

    await expect(button.tagName).toBe('SPAN');
    await expect(button).not.toHaveAttribute('href');
    await expect(canvas.queryByRole('link')).not.toBeInTheDocument();
  },
};
