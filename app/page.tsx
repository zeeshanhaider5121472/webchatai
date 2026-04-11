"use client";
import LoaderSpinner from "@/components/loaderspinner";
import WaveAnimation from "@/components/wave_animation";
import { useChat } from "@/hooks/useChat";
import ChatViewWindow from "./home/chatviewwindow";
import { Topbar } from "./home/topbar";
import WriteQuery from "./home/writequery";

export default function Home() {
  const {
    chats,
    content,
    setContent,
    websiteContent,
    isUpdating,
    isUpdatingWebsite,
    url,
    setUrl,
    handleUpdateWebsiteContent,
    handleSubmit,
    handleDeleteAll,
  } = useChat();

  return (
    <main className="flex justify-center flex-1 bg-white ">
      {isUpdatingWebsite ? (
        <LoaderSpinner />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 items-start justify-around max-w-2xl w-full p-3"
        >
          <Topbar
            url={url}
            setUrl={setUrl}
            handleUpdateWebsiteContent={handleUpdateWebsiteContent}
            handleDeleteAll={handleDeleteAll}
          />
          {chats.length === 0 ? (
            <WaveAnimation />
          ) : (
            <ChatViewWindow
              chats={chats}
              content={content}
              isUpdating={isUpdating}
            />
          )}
          <WriteQuery
            content={content}
            setContent={setContent}
            isUpdating={isUpdating}
          />
        </form>
      )}
    </main>
  );
}
