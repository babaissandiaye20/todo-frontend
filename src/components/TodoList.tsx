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

  async function handleDelete(todo: Todo) {
    if (!window.confirm(`Delete todo "${todo.title}" ?`)) return;

    setPendingIds((prev) => new Set(prev).add(todo.id));
    try {
      await todosService.remove(todo.id);
      setTodos((prev) => prev.filter((t) => t.id !== todo.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(todo.id);
        return next;
      });
    }
    // On success, the item is removed from the list — no need to clean pendingIds for that id.
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
            <button
              type="button"
              aria-label={`Delete todo ${todo.id}`}
              disabled={pendingIds.has(todo.id)}
              onClick={() => void handleDelete(todo)}
              className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:cursor-wait disabled:opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
