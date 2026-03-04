import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: [
    "en", "tr", "es", "fr", "de", "pt", "ru", "zh", "ja", "ko",
    "ar", "hi", "vi", "th", "id", "tl", "uk", "fa", "pl",
  ],
  defaultLocale: "en",
  localePrefix: "always",
});
