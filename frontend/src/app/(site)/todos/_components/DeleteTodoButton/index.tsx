'use client';

import { Button, Group, Modal, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { FC, useTransition } from 'react';
import { deleteTodoAction } from '@/features/todos/actions';
import { Todo } from '@/features/todos/types';

type Props = Readonly<{
  todo: Todo;
}>;

export const DeleteTodoButton: FC<Props> = ({ todo }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteTodoAction(todo.id);

      if (result.type !== 'success') {
        const message = (() => {
          switch (result.type) {
            case 'not-found':
              return '対象のTodoが見つかりませんでした';
            default:
              // bad-requestはidが数値ではない場合なので、bad-requestになることはない想定
              result.type satisfies 'bad-request' | 'error';
              return '削除に失敗しました。時間をおいて再度お試しください。';
          }
        })();

        notifications.show({
          color: 'red',
          title: 'エラー',
          message,
        });
        return;
      }

      notifications.show({
        color: 'green',
        title: '成功',
        message: 'Todoを削除しました',
      });
      close();
      router.push('/todos');
    });
  };

  return (
    <>
      <Button color="red" variant="outline" onClick={open}>
        削除
      </Button>
      <Modal opened={opened} onClose={close} title="Todoの削除">
        <Text mb="md">
          「{todo.title}」を削除しますか？この操作は取り消せません。
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={close} disabled={isPending}>
            キャンセル
          </Button>
          <Button color="red" onClick={handleDelete} loading={isPending}>
            削除する
          </Button>
        </Group>
      </Modal>
    </>
  );
};
