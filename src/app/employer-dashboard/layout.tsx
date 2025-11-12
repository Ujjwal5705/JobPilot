import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../features/auth/server/auth.queries";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser()
  console.log('User: ', user)

  if(!user) return redirect('/login');
  if (user.role != 'employer') return redirect('/dashboard');

  return <>{children}</>;
}