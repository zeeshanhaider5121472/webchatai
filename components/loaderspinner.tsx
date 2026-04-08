export default function LoaderSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-purple-600 border-dashed rounded-full animate-spin [animation-duration:3s]"></div>
    </div>
  );
}