import { Alert, Stack } from '@mantine/core';
import { LinkButton } from '@/components/LinkButton';

export default function TodoNotFound() {
  return (
    <Stack>
      <Alert color="yellow" title="Todoが見つかりません">
        指定されたTodoは存在しないか、削除された可能性があります。
      </Alert>
      <LinkButton href="/todos" variant="subtle" w="fit-content">
        一覧に戻る
      </LinkButton>
    </Stack>
  );
}
