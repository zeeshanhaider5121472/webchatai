export default function WriteQuery({
  content,
  setContent,
  isUpdating,
}: {
  content: string;
  setContent: any;
  isUpdating: boolean;
}) {
  return (
    <div className="flex w-full gap-2">
      <input
        type="text"
        value={isUpdating ? "updating..." : content}
        onChange={(e) => setContent(e.target.value)}
        className="mx-3 w-full shadow-purple-100 shadow-md rounded-full p-4 disabled:opacity-50 focus:shadow-purple-300 focus:outline-none "
        placeholder="Type your query here..."
        disabled={isUpdating}
      ></input>
      <button
        type="submit"
        className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-full hover:bg-green-700 disabled:color-gray-300 disabled:opacity-50 transition"
        disabled={isUpdating}
      >
        <svg
          className="w-6 h-6 text-White dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 14"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M5 13V1m0 0L1 5m4-4 4 4"
          />
        </svg>
      </button>
    </div>
  );
}
