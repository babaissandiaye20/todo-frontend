'use client';

import { useCallback, useEffect, useState } from 'react';
import { todosService } from '@/services/todos.service';
import type { Priority, Todo } from '@/utils/types';

const priorityStyles: Record<Priority, string> = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-red-100 text-red-700',
};

interface Props {
  refreshKey?: number;
}

export function TodoList({ refreshKey = 0 }: Props) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // IDs of todos currently being toggled — disables their checkbox to prevent double-clicks.
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await todosService.list();
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load todos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTodos();
  }, [fetchTodos, refreshKey]);

  async function handleToggleComplete(todo: Todo) {
    setPendingIds((prev) => new Set(prev).add(todo.id));
    try {
      const updated = await todosService.update(todo.id, { completed: !todo.completed });
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo');
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(todo.id);
        return next;
      });
    }
  }

  if (loading) {
    return <p className="py-6 text-sm text-gray-500">Loading todos...</p>;
  }

  if (error) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-red-700">Error: {error}</p>
        <button
          type="button"
          onClick={() => void fetchTodos()}
          className="text-sm text-indigo-600 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (todos.length === 0) {
    return <p className="py-6 text-sm text-gray-500">No todos yet. Create your first one above.</p>;
  }

  return (
    <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white shadow-sm">
      {todos.map((todo) => (
        <li key={todo.id} className="px-4 py-3">
          <div className="flex items-start gap-3">
            <input
              id={`todo-${todo.id}-completed`}
              type="checkbox"
              checked={todo.completed}
              disabled={pendingIds.has(todo.id)}
              onChange={() => void handleToggleComplete(todo)}
              className="mt-0.5 h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:cursor-wait disabled:opacity-50"
            />
            <div className="min-w-0 flex-1">
              <label
                htmlFor={`todo-${todo.id}-completed`}
                className={`block cursor-pointer truncate text-sm font-medium ${
                  todo.completed ? 'text-gray-400 line-through' : 'text-gray-900'
                }`}
              >
                #{todo.id} &middot; {todo.title}
              </label>
              {todo.description && (
                <p className="mt-1 text-xs text-gray-500 line-clamp-2">{todo.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                Created {new Date(todo.createdAt).toLocaleString()}
                {todo.dueDate && (
                  <> &middot; Due {new Date(todo.dueDate).toLocaleDateString()}</>
                )}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${priorityStyles[todo.priority]}`}
            >
              {todo.priority}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
