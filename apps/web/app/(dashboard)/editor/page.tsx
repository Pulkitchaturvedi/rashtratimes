import Link from 'next/link';
import { apiClient } from '@/lib/api';

async function getDrafts() {
  return apiClient.listArticles({ status: 'DRAFT', pageSize: 20 });
}

export default async function EditorIndexPage() {
  const data = await getDrafts();
  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Story editor</h1>
          <p className="text-sm text-muted-foreground">
            Continue drafting or collaborate on articles assigned to you.
          </p>
        </div>
      </header>
      <ul className="divide-y rounded-lg border">
        {data.data.map((article) => (
          <li key={article.id} className="flex items-center justify-between p-4 hover:bg-muted/40">
            <div>
              <p className="font-medium">{article.title}</p>
              <p className="text-sm text-muted-foreground">{article.section}</p>
            </div>
            <Link href={`/editor/${article.id}`} className="text-sm text-primary hover:underline">
              Open editor
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
