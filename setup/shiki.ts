/* ./setup/shiki.ts */
import { defineShikiSetup } from "@slidev/types";
import theme from "tm-themes/themes/one-dark-pro.json";

export default defineShikiSetup(() => {
  return {
    themes: {
      dark: theme,
      light: "min-light",
    },
    transformers: ["javascript"],
  };
});
