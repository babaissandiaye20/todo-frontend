import { TodoForm } from '@/components/TodoForm';

export default function HomePage() {
  return (
    <main className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900">Todo App</h1>
      <p className="mt-2 text-sm text-gray-500">
        Create a new task &mdash; the list view will arrive in the next feature.
      </p>

      <section className="mt-8">
        <TodoForm />
      </section>
    </main>
  );
}
