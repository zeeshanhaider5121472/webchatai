import { ChatData } from "@/hooks/useChat";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

export default function ChatViewWindow({
  chats,
  content,
  isUpdating,
}: {
  chats: ChatData[];
  content: string;
  isUpdating: boolean;
}) {
  // Inside your component:
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Automatically scroll to the bottom when messages or loading state changes
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, isUpdating]);

  return (
    <div className="h-[70vh] w-full overflow-y-auto [&::-webkit-scrollbar]:w-0 p-4 ">
      <div className="flex flex-col-reverse">
        {chats
          .slice()
          .reverse()
          .map((chat) => (
            <div key={chat.id} className="mb-15 ">
              <div className="flex justify-end">
                <div className="py-2 px-4 mb-5 text-right bg-purple-100 border border-gray-50 rounded-2xl whitespace-pre-wrap max-w-lg">
                  <ReactMarkdown>{chat.title}</ReactMarkdown>
                </div>
              </div>
              <div className="p-2 text-left mb-2 bg-purple-100 max-w-xl overflow-x-auto">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      pre: ({ node, ...props }) => (
                        <pre
                          className="whitespace-pre-wrap break-words"
                          {...props}
                        />
                      ),
                      code: ({ node, ...props }) => (
                        <code
                          className="whitespace-pre-wrap break-words"
                          {...props}
                        />
                      ),
                    }}
                  >
                    {chat.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
      </div>
      {isUpdating && (
        <div className="mb-8 ">
          <div className="flex justify-end">
            <p className="py-2 px-4 mb-5 text-right bg-purple-100 border border-gray-50 rounded-2xl whitespace-pre-wrap max-w-lg">
              {content}
            </p>
          </div>
          <div className="flex justify-start">
            <p className="p-2 text-left mb-2 whitespace-pre-wrap">
              Searching for answer...
            </p>
          </div>
        </div>
      )}
      <div ref={scrollRef} />
    </div>
  );
}
