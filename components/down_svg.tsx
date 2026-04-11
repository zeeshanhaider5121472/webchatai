export function DownSvg({
  setShowWebsiteWriter,
  showWebsiteWriter,
}: {
  setShowWebsiteWriter: any;
  showWebsiteWriter: boolean;
}) {
  const handleopenwebsitewriter = () => {
    setShowWebsiteWriter(!showWebsiteWriter);
  };
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-10 h-10 stroke-blue-500 rounded-full bg-purple-50 hover:bg-purple-500 hover:stroke-white"
      onClick={handleopenwebsitewriter}
    >
      <path
        d={showWebsiteWriter ? "M8 14L12 10L16 14" : "M8 10L12 14L16 10"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
