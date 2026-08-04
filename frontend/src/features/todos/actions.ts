'use server';

import { revalidatePath } from 'next/cache';
import { createTodo, deleteTodo, updateTodo } from './api';
import { TodoInput } from './types';

export async function createTodoAction(input: TodoInput) {
  const result = await createTodo(input);
  revalidatePath('/todos');
  return result;
}

export async function updateTodoAction(id: number, input: TodoInput) {
  const result = await updateTodo(id, input);
  revalidatePath('/todos');
  revalidatePath(`/todos/${id}`);
  return result;
}

export async function deleteTodoAction(id: number) {
  const result = await deleteTodo(id);
  revalidatePath('/todos');
  return result;
}
