"use client";
import LoaderSpinner from "@/components/loaderspinner";
import WaveAnimation from "@/components/wave_animation";
import {
  createPost,
  deleteAllData,
  fetchData,
  uploadWebsiteDataDB,
} from "@/lib/api";
import { useEffect, useState } from "react";
import ChatViewWindow from "./home/chatviewwindow";
import Header from "./home/header";
import WriteQuery from "./home/writequery";

export interface ChatData {
  id: string;
  title: string;
  content: string;
}
export interface ApiResponse {
  Website: string;
  chats: ChatData[];
}
export interface WebsiteData1 {
  scrapedData: string;
}

export default function Home() {
  const [chats, setChats] = useState<ChatData[]>([]);
  const [content, setContent] = useState("");
  const [websiteContent, setWebsiteContent] = useState("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isUpdatingWebsite, setIsUpdatingWebsite] = useState<boolean>(false);
  const [url, setUrl] = useState("");

  // useEffect(() => {
  //   const getData = async () => {
  //     const getChats: ApiResponse = await fetchData();
  //     setChats(getChats.chats);
  //     console.log("data: "+getChats);
  //     // setWebsiteContent(getChats.Website.scrapedData);
  //   };
  //   getData();
  // }, []);

  useEffect(() => {
    const getData = async () => {
      try {
        const getChats: ApiResponse = await fetchData();
        setChats(getChats.chats);
        console.log("data:", getChats);
        setWebsiteContent(getChats.Website);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    getData();
  }, []);

  const handleUpdateWebsiteContent = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    setIsUpdatingWebsite(true);
    const res = await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: url, // replace with your site link
      }),
    });
    if (!res.ok) return;
    const data = await res.json();

    // Save AI reply into db.json
    const webData = {
      scrapedData: JSON.stringify(data.scrapedData), // stringify only once here
    };
    await uploadWebsiteDataDB(webData);

    setWebsiteContent(data.scrapedData);
    setIsUpdatingWebsite(false);
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    // Call Gemini API route
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: content,
        websiteContent: websiteContent,
        history: chats.flatMap((chat) => [
          { role: "user", content: chat.title },
          { role: "assistant", content: chat.content },
        ]),
      }),
    });

    if (!res.ok) return setIsUpdating(false);

    const data = await res.json();

    // Save AI reply into db.json
    const aiChat = {
      id: Date.now().toString(),
      title: content,
      content: data.reply,
    };
    setContent("");
    await createPost(aiChat);
    setChats((prev) => [...prev, aiChat]);
    setIsUpdating(false);
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllData();
      setChats([]);
      setContent("");
      setWebsiteContent("");
      alert("All chats deleted successfully!");
    } catch {
      alert("Failed to delete chats");
    }
  };

  return (
    <main className="flex justify-center flex-1 bg-white ">
      {isUpdatingWebsite ? (
        <LoaderSpinner />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 items-start justify-around max-w-2xl w-full p-3"
        >
          <span className="flex flex-col">
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
          </span>
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
function deleteData() {
  throw new Error("Function not implemented.");
}
