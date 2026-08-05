import { Group, Title } from '@mantine/core';
import { LinkButton } from '@/components/LinkButton';
import { TodosTable } from './_components/TodosTable';

export const dynamic = 'force-dynamic';

export default function TodosPage() {
  return (
    <div>
      <Group justify="space-between" mb="md">
        <Title order={1}>Todos</Title>
        <LinkButton href="/todos/new">新規作成</LinkButton>
      </Group>
      <TodosTable />
    </div>
  );
}
