import { Group, Stack, Text, Title } from '@mantine/core';
import { notFound } from 'next/navigation';
import { LinkButton } from '@/components/LinkButton';
import { fetchTodo } from '@/features/todos/api';
import { FIELD_LABELS } from '@/features/todos/field-labels';
import { DeleteTodoButton } from '../_components/DeleteTodoButton';

type Props = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function TodoDetailPage({ params }: Props) {
  const { id } = await params;
  const todoId = Number(id);
  if (!Number.isInteger(todoId)) {
    notFound();
  }

  const result = await fetchTodo(todoId);
  if (result.type === 'bad-request' || result.type === 'not-found') {
    notFound();
  }
  if (result.type === 'error') {
    throw new Error('Todoの取得に失敗しました');
  }

  const todo = result.data;

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={1}>{todo.title}</Title>
        <Group>
          <LinkButton href={`/todos/${todo.id}/edit`}>編集</LinkButton>
          <DeleteTodoButton todo={todo} />
        </Group>
      </Group>

      <Stack gap={4}>
        <Text fw={700}>{FIELD_LABELS.description}</Text>
        <Text style={{ whiteSpace: 'pre-wrap' }}>{todo.description}</Text>
      </Stack>

      <Stack gap={4}>
        <Text fw={700}>{FIELD_LABELS.dueDate}</Text>
        <Text>{todo.dueDate ?? '-'}</Text>
      </Stack>

      <LinkButton href="/todos" variant="subtle" w="fit-content">
        一覧に戻る
      </LinkButton>
    </Stack>
  );
}
