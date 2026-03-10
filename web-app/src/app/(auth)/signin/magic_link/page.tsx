import { SignInMagicLink } from "@/components/feature/auth/signin/SignInMagicLink";

export default function page() {
  return (
    <div className="w-full max-w-md">
      <SignInMagicLink email="user@example.com" />
    </div>
  );
}
