import { useRef, useState } from 'react';
import reactLogo from './assets/react.svg';
import './App.css';

function App() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [count, setCount] = useState(0);
  const [address, setAddress] = useState('');

  const searchAddress = async () => {
    await fetch(`${import.meta.env.VITE_API_GATEWAY_DOMAIN}?id=${inputRef.current?.value}`)
      .then((res) => res.json())
      .then((value) => {
        setAddress(JSON.stringify(value));
      });
  };

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
      ID:
      <input ref={inputRef} type="text" />
      <button onClick={searchAddress}>検索</button>
      <h3>{address}</h3>
    </div>
  );
}

export default App;
