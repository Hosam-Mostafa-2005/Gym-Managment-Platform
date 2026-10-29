import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/query-client";

import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

import "./i18n";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        theme="dark"
        position="top-right"
        richColors
        closeButton
        gap={8}
        mobileOffset={{ top: 16, right: 16, left: 16, bottom: 16 }}
        toastOptions={{
          style: {
            background: "#13171D",
            border: "1px solid #2A3039",
            color: "#F8FAFC",
            borderRadius: "14px",
          },
          className:
            "w-[calc(100vw-32px)] sm:w-auto max-w-md break-words whitespace-normal text-xs sm:text-sm font-sans shadow-2xl",
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
