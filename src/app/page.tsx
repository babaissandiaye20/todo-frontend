export default function HomePage() {
  return (
    <main className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900">Todo App</h1>
      <p className="mt-3 text-gray-600">
        Frontend Next.js connect&eacute; au backend NestJS via{' '}
        <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-800">
          {process.env.NEXT_PUBLIC_API_URL ?? 'NEXT_PUBLIC_API_URL non défini'}
        </code>
      </p>
    </main>
  );
}
