// Types shared with the backend (NestJS + Prisma).
// Keep in sync with todo-backend/prisma/schema.prisma.

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  priority: Priority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
}

export interface ListTodosFilters {
  completed?: boolean;
  priority?: Priority;
}
