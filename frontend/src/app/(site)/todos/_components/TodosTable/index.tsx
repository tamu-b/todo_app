import { fetchTodos } from '@/features/todos/api';
import { TodosTablePresenter } from './presenter';

export const TodosTable = async () => {
  const result = await fetchTodos();

  if (result.type === 'error') {
    throw new Error('Todo一覧の取得に失敗しました');
  }

  return <TodosTablePresenter todos={result.data} />;
};
