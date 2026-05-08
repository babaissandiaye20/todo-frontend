'use client';

import { useState } from 'react';
import { TodoForm } from '@/components/TodoForm';
import { TodoList } from '@/components/TodoList';

export default function HomePage() {
  // Bumping refreshKey causes <TodoList> to re-fetch.
  // Used to keep the list in sync after a successful create.
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900">Todo App</h1>
      <p className="mt-2 text-sm text-gray-500">
        Create a task above &mdash; it appears in the list below.
      </p>

      <section className="mt-8">
        <TodoForm onCreated={() => setRefreshKey((k) => k + 1)} />
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Your todos</h2>
        <TodoList refreshKey={refreshKey} />
      </section>
    </main>
  );
}
