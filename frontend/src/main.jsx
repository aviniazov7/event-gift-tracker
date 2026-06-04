import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// react-day-picker base styles first, so our theme overrides in index.css win.
import "react-day-picker/style.css";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
