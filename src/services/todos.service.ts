// Service layer for /todos. UI must go through this module — never call `fetch` directly.

import type { CreateTodoInput, ListTodosFilters, Todo } from '@/utils/types';
import { http } from './http';

export const todosService = {
  create(input: CreateTodoInput): Promise<Todo> {
    return http.post<Todo>('/todos', input);
  },

  list(filters: ListTodosFilters = {}): Promise<Todo[]> {
    return http.get<Todo[]>('/todos', { query: filters });
  },
};
