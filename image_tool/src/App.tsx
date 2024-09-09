import { client } from '@api/pure_client';

function App() {
  console.log(typeof client);
  return <div className="text-xl">Test App</div>;
}

export default App;
