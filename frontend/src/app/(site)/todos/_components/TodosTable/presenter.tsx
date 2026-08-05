'use client';

import { Table } from '@mantine/core';
import { FC } from 'react';
import { Todo } from '@/features/todos/types';
import { LinkButton } from '../../../../../components/LinkButton';

type Props = Readonly<{
  todos: ReadonlyArray<Todo>;
}>;

export const TodosTablePresenter: FC<Props> = ({ todos }) => {
  const rows = todos.map((todo) => (
    <Table.Tr key={todo.id}>
      <Table.Td>{todo.id}</Table.Td>
      <Table.Td
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {todo.title}
      </Table.Td>
      <Table.Td>{todo.dueDate ?? '-'}</Table.Td>
      <Table.Td>
        <LinkButton href={`/todos/${todo.id}`} size="xs" variant="subtle">
          詳細
        </LinkButton>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Table layout="fixed">
      <Table.Thead>
        <Table.Tr>
          <Table.Th w={30}>ID</Table.Th>
          <Table.Th w={120}>タイトル</Table.Th>
          <Table.Th w={100}>期限日</Table.Th>
          <Table.Th w={80} />
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};
