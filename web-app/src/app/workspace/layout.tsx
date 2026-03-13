import { authClient } from "@/lib/auth-client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data, error } = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!data) {
    redirect("/signin");
  }

  return <div>{children}</div>;
}
