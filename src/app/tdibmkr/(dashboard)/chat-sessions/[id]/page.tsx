import ChatSessionDetail from "@/components/module/admin/chat-session/ChatSessionDetail";

type Props = {
  params: Promise<{ id: string }>;
};

const page = async ({ params }: Props) => {
  const { id } = await params;
  return <ChatSessionDetail id={id} />;
};

export default page;
