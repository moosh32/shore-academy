import type { Metadata } from "next";
import { LoginForm } from "@/components/auth-forms";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "כניסה" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/app") ? params.next : "/app";

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <PageIntro title="כניסה">חוזרים ללוח, לשיעורים ולמעבדה.</PageIntro>
      <LoginForm nextPath={nextPath} />
    </div>
  );
}
