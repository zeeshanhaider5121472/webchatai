import {
  createPost,
  deleteAllData,
  fetchData,
  uploadWebsiteDataDB,
} from "@/lib/api";
import { useEffect, useState } from "react";

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

export function useChat() {
  const [chats, setChats] = useState<ChatData[]>([]);
  const [content, setContent] = useState("");
  const [websiteContent, setWebsiteContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingWebsite, setIsUpdatingWebsite] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const getData = async () => {
      try {
        const getChats: ApiResponse = await fetchData();
        setChats(getChats.chats);
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
      body: JSON.stringify({ url }),
    });
    if (!res.ok) return;
    const data = await res.json();

    const webData = { scrapedData: JSON.stringify(data.scrapedData) };
    await uploadWebsiteDataDB(webData);

    setWebsiteContent(data.scrapedData);
    setIsUpdatingWebsite(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: content,
        websiteContent,
        history: chats.flatMap((chat) => [
          { role: "user", content: chat.title },
          { role: "assistant", content: chat.content },
        ]),
      }),
    });

    if (!res.ok) return setIsUpdating(false);

    const data = await res.json();
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

  return {
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
  };
}
