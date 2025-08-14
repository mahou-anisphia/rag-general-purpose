import { ChatContainer } from "../_components/chat-container";

interface ChatSessionPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatSessionPage({
  params,
}: ChatSessionPageProps) {
  const { id } = await params;

  return <ChatContainer chatId={id} />;
}
