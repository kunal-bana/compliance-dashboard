import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { CssBaseline } from "@mui/material";
import App from "./App";
import "./agGridSetup";

import { store } from "./app/store";
import AuthListener from "./app/AuthListener";
import { ThemeContextProvider } from "./theme/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeContextProvider>
          <CssBaseline />
          <AuthListener />
          <App />
        </ThemeContextProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
