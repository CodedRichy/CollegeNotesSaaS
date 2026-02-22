import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users_test")
    .select("*");

  return (
    <main className="flex min-h-screen items-center justify-center">
      <pre>{JSON.stringify({ data, error }, null, 2)}</pre>
    </main>
  );
}