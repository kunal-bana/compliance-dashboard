import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { CssBaseline } from "@mui/material";
import App from "./App";
import "./agGridSetup";
import { Toaster } from "react-hot-toast";
import { store } from "./app/store";
import { ThemeContextProvider } from "./theme/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
      <Toaster
            position="top-right"
            toastOptions={{
              style: {
                zIndex: 999999, 
              },
            }}
          />
        <ThemeContextProvider>
          <CssBaseline />
          <App />
        </ThemeContextProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
