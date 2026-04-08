import { ApiResponse, ChatData, WebsiteData1 } from "@/app/page";

const API_URL = "https://json-db-api-production.up.railway.app/chats";
const API_URL2 = "https://json-db-api-production.up.railway.app/Website";

export const deleteAllData = async () => {
  // Delete all chats one by one
  const chatsRes = await fetch(API_URL);
  const chats = await chatsRes.json();

  await Promise.all(
    chats.map((chat: any) =>
      fetch(`${API_URL}/${chat.id}`, { method: "DELETE" }),
    ),
  );

  // Reset Website
  await fetch(API_URL2, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scrapedData: "" }),
  });

  return { success: true };
};

export const fetchData = async (): Promise<ApiResponse> => {
  const [websiteRes, chatsRes] = await Promise.all([
    fetch(API_URL2),
    fetch(API_URL),
  ]);

  if (!websiteRes.ok || !chatsRes.ok) {
    throw new Error("Failed to fetch data");
  }

  const website = await websiteRes.json();
  const chats = await chatsRes.json();

  return { Website: website, chats };
};
export const createPost = async (e: ChatData) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(e),
  });
  if (!res.ok) {
    throw new Error("Failed to upload answer");
  }
  return res.json();
};

export const uploadWebsiteDataDB = async (e: WebsiteData1) => {
  const res = await fetch(API_URL2, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(e),
  });

  const text = await res.text();
  console.log("Response:", res.status, text);

  if (!res.ok) {
    throw new Error("Failed to Upload Website data");
  }
  return JSON.parse(text);
};
