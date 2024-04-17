import { Route, Router, Routes } from "react-router-dom";
import { createBrowserHistory } from "history";
import Home from "./pages/Home";
import './styles/Global.scss';

function App() {
  const history = createBrowserHistory();
  return (
    <Router location={""} navigator={history}>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
