'use client';

import { Button, ButtonProps } from '@mantine/core';
import Link from 'next/link';
import { FC, ReactNode } from 'react';

type Props = ButtonProps &
  Readonly<{
    href: string;
    children: ReactNode;
  }>;

export const LinkButton: FC<Props> = ({
  href,
  children,
  disabled,
  ...buttonProps
}) =>
  disabled ? (
    <Button component="span" disabled {...buttonProps}>
      {children}
    </Button>
  ) : (
    <Button component={Link} href={href} {...buttonProps}>
      {children}
    </Button>
  );
