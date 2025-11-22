import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  // 👇 ВАЖНО: Убедитесь, что это ТОЧНОЕ имя вашего репозитория
  base: "/antique-nft-minting-dapp/",

  plugins: [
    tailwindcss(), // 👈 Убрал лишние скобки []
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
});
