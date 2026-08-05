import { Stack, Title } from '@mantine/core';
import { notFound } from 'next/navigation';
import { fetchTodo } from '@/features/todos/api';
import { TodoForm } from '../../_components/TodoForm';

type Props = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function EditTodoPage({ params }: Props) {
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
      <Title order={1}>Todoを編集</Title>
      <TodoForm type="update" todo={todo} />
    </Stack>
  );
}
