import { useEffect, useState } from "react";

export default function CountIncreaser() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  }, [count]); // Only re-run the effect if count changes
  return (
    <div>
      <>{document.title}</>
      <button onClick={() => setCount(count + 1)}>click</button>
    </div>
  );
}
