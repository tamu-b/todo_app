'use client';

import { Button, Group, Stack, Textarea, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FC, useTransition } from 'react';
import { z } from 'zod';
import { createTodoAction, updateTodoAction } from '@/features/todos/actions';
import {
  DESCRIPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
} from '@/features/todos/constants';
import { FIELD_LABELS } from '@/features/todos/field-labels';
import { todoFormSchema } from '@/features/todos/schema';
import { Todo } from '@/features/todos/types';

type Props = Readonly<
  { type: 'create' } | { type: 'update'; todo: Readonly<Todo> }
>;

type FormValues = z.infer<typeof todoFormSchema>;

export const TodoForm: FC<Props> = (props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const todo = props.type === 'update' ? props.todo : undefined;
  const form = useForm<FormValues>({
    initialValues: {
      title: todo?.title ?? '',
      description: todo?.description ?? '',
      dueDate: todo?.dueDate ?? null,
    },
    validate: zod4Resolver(todoFormSchema),
  });

  const cancelHref =
    props.type === 'update' ? `/todos/${props.todo.id}` : '/todos';

  const handleSubmit = form.onSubmit((values) => {
    const input = {
      title: values.title,
      description: values.description,
      dueDate: values.dueDate,
    };

    startTransition(async () => {
      const result =
        props.type === 'update'
          ? await updateTodoAction(props.todo.id, input)
          : await createTodoAction(input);

      if (result.type === 'validation-error') {
        form.setErrors({
          title: result.message.title?.[0],
          description: result.message.description?.[0],
          dueDate: result.message.dueDate?.[0],
        });
        return;
      }

      if (result.type !== 'success') {
        notifications.show({
          color: 'red',
          title: 'エラー',
          message:
            result.type === 'not-found'
              ? '対象のTodoが見つかりませんでした'
              : '処理に失敗しました。時間をおいて再度お試しください。',
        });
        return;
      }

      result.type satisfies 'success';
      notifications.show({
        color: 'green',
        title: '成功',
        message:
          props.type === 'update' ? 'Todoを更新しました' : 'Todoを作成しました',
      });
      router.push(`/todos/${result.data.id}`);
    });
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack maw={480}>
        <TextInput
          label={FIELD_LABELS.title}
          withAsterisk
          maxLength={TITLE_MAX_LENGTH}
          {...form.getInputProps('title')}
        />
        <Textarea
          label={FIELD_LABELS.description}
          withAsterisk
          maxLength={DESCRIPTION_MAX_LENGTH}
          {...form.getInputProps('description')}
        />
        <DateInput
          label={FIELD_LABELS.dueDate}
          clearable
          valueFormat="YYYY-MM-DD"
          {...form.getInputProps('dueDate')}
        />
        <Group justify="flex-end">
          <Button component={Link} href={cancelHref} variant="default">
            キャンセル
          </Button>
          <Button type="submit" loading={isPending}>
            {props.type === 'update' ? '更新' : '作成'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
