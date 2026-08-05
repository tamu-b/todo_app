import { Stack, Title } from '@mantine/core';
import { TodoForm } from '../_components/TodoForm';

export default function NewTodoPage() {
  return (
    <Stack>
      <Title order={1}>Todoを作成</Title>
      <TodoForm type="create" />
    </Stack>
  );
}
