import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { ChatLayoutClient } from "~/components/chat";

interface ChatLayoutProps {
  children: React.ReactNode;
}

export default async function ChatLayout({ children }: ChatLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <ChatLayoutClient>{children}</ChatLayoutClient>;
}
