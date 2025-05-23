import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./components/App.jsx";
import { store } from "./store.js";
import { BrowserRouter } from "react-router-dom";


const container = document.getElementById("tetris");
if (container) {
  const root = createRoot(container);
  root.render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  );
} else if (process.env.NODE_ENV === "test")
  console.log("🧩 Test environment");
else
  console.error("❌ Failed to find root container #tetris. App not rendered.");