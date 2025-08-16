import { useState } from 'react';

export default function HelloReact() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h2>Hello from React!</h2>
      <button onClick={() => setCount(count + 1)}>
        カウント: {count}
      </button>
    </div>
  );
}
