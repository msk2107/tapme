import MobileShell from "@/components/MobileShell";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  return (
    <MobileShell>
      <LoginForm next={params.next} />
    </MobileShell>
  );
}
