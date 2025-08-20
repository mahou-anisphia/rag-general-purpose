import { ChatContainer } from "~/components/chat";

interface ChatSessionPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatSessionPage({
  params,
}: ChatSessionPageProps) {
  const { id } = await params;

  return <ChatContainer chatId={id} />;
}
