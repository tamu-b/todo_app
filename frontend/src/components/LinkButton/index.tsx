'use client';

import { Button, ButtonProps } from '@mantine/core';
import Link from 'next/link';
import { FC, ReactNode } from 'react';

type Props = ButtonProps &
  Readonly<{
    href: string;
    children: ReactNode;
  }>;

export const LinkButton: FC<Props> = ({ href, children, ...buttonProps }) => (
  <Button component={Link} href={href} {...buttonProps}>
    {children}
  </Button>
);
