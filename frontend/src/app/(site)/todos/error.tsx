'use client';

import { Alert, Button, Stack } from '@mantine/core';

export default function TodosError({
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <Stack>
      <Alert color="red" title="Todoの読み込みに失敗しました">
        バックエンドとの通信に失敗しました。時間をおいて再度お試しください。
      </Alert>
      <Button onClick={reset} w="fit-content">
        再読み込み
      </Button>
    </Stack>
  );
}
