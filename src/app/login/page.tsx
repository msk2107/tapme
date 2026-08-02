import MobileShell from "@/components/MobileShell";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; ref?: string }>;
}) {
  const params = await searchParams;
  return (
    <MobileShell>
      <LoginForm next={params.next} referrerId={params.ref} />
    </MobileShell>
  );
}
