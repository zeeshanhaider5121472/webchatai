import { DownSvg } from "@/components/down_svg";
import Header from "./header";

export function Topbar({
  url,
  setUrl,
  handleUpdateWebsiteContent,
  handleDeleteAll,
  setShowWebsiteWriter,
  showWebsiteWriter,
}: {
  url: string;
  setUrl: any;
  handleUpdateWebsiteContent: any;
  handleDeleteAll: any;
  setShowWebsiteWriter: any;
  showWebsiteWriter: boolean;
}) {
  return (
    <div className="flex flex-col">
      {showWebsiteWriter && (
        <div>
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
        </div>
      )}
      <div className="flex flex-row items-center gap-2.5">
        <Header />
        <DownSvg
          setShowWebsiteWriter={setShowWebsiteWriter}
          showWebsiteWriter={showWebsiteWriter}
        />
      </div>
    </div>
  );
}
