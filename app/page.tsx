"use client";
import LoaderSpinner from "@/components/loaderspinner";
import WaveAnimation from "@/components/wave_animation";
import { useChat } from "@/hooks/useChat";
import ChatViewWindow from "./home/chatviewwindow";
import Header from "./home/header";
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
          <div className="flex flex-col">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full shadow-purple-50 shadow-md rounded-md p-2"
              placeholder="Enter URL to scrape content..."
            ></input>
            <span className="flex gap-2 mt-2 pb-3">
              <button
                type="button"
                className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition"
                onClick={handleUpdateWebsiteContent}
              >
                Load Content
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-400 text-white font-semibold rounded-md hover:bg-purple-700 transition"
                onClick={handleDeleteAll}
              >
                X
              </button>
            </span>
            <Header />
          </div>
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
