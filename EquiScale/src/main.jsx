import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ActuarialProvider } from "./context/ActuarialProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ActuarialProvider>
        <App />
      </ActuarialProvider>
    </BrowserRouter>
  </React.StrictMode>
);
