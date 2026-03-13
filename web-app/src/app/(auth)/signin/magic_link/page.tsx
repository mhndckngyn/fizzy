import { VerifyToken } from "@/components/feature/auth/signin/VerifyToken";
import { getPendingAuthEmail } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function VerifyTokenPage() {
  const email = await getPendingAuthEmail();

  if (!email) {
    redirect("/signin");
  }

  return (
    <div className="w-full max-w-md">
      <VerifyToken email={email} />
    </div>
  );
}
