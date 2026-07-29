import type { Meta, StoryObj } from '@storybook/nextjs-vite';
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

export const Default: Story = {};

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
};
