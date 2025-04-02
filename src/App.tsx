import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ClickUpTaskPanel from "./components/ClickUpTaskPanel";
import CallbackHandler from "./components/CallbackHandler";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ClickUpTaskPanel />} />
        <Route path="/callback" element={<CallbackHandler />} />
      </Routes>
    </Router>
  );
}
