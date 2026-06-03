import { authClient } from "@/lib/auth-client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data, error } = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (data) {
    redirect("/workspace");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      {children}
    </div>
  );
}
