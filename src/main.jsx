import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import App from './client/components/App.jsx'
import { Provider } from "react-redux";
import { store } from "./client/store.js";
import { BrowserRouter } from "react-router-dom";


let basename = "/";
if (import.meta.env.VITE_ENV === "production") {
  basename = "/red/";
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
