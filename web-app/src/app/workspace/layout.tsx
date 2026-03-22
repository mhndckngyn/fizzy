import Footer from "@/components/layouts/Footer";
import Header from "@/components/layouts/Header";
import { authClient } from "@/lib/auth-client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data } = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!data) {
    redirect("/signin");
  }

  return (
    <div>
      <Header />
      {children}
      <Footer />
    </div>
  );
}
