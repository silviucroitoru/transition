import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { IntlProvider } from "react-intl";
import App from "./App.jsx";
import "./index.css";
import EnglishMessages from "./locales/en/translations.json";
import RomanianMessages from "./locales/ro/translations.json";

const messages = {
  en: EnglishMessages,
  ro: RomanianMessages,
};

const DEFAULT_LANGUAGE = "en";

const getInitialLanguage = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get("language")?.toLowerCase();
  if (urlLang && messages[urlLang]) {
    localStorage.setItem("language", urlLang);
    return urlLang;
  }
  localStorage.setItem("language", DEFAULT_LANGUAGE);
  return DEFAULT_LANGUAGE;
};

const Root = () => {
  const [language, setLanguage] = useState(getInitialLanguage());

  useEffect(() => {
    const handleStorageChange = () => {
      const newLang = localStorage.getItem("language")?.toLowerCase();
      if (newLang && messages[newLang] && newLang !== language) {
        setLanguage(newLang);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [language]);

  return (
    <IntlProvider locale={language} messages={messages[language]}>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </IntlProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
