export default function manifest() {
  return {
    name: "Malik Sajawal Refreshment Accounting",
    short_name: "MSR Accounting",
    description:
      "Daily sales, purchases, reports, and accounting for Malik Sajawal Refreshment.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f6f8f7",
    theme_color: "#0f9f7a",
    dir: "rtl",
    lang: "ur",
    categories: ["business", "finance", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "ڈیش بورڈ",
        short_name: "Dashboard",
        description: "Open the accounting dashboard.",
        url: "/dashboard",
        icons: [
          {
            src: "/icons/shortcut-dashboard.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "نئی خریداری",
        short_name: "Purchases",
        description: "Add a new purchase entry.",
        url: "/purchases/new",
        icons: [
          {
            src: "/icons/shortcut-purchase.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "روزانہ انٹری",
        short_name: "Daily Entry",
        description: "Open the daily accounting entry screen.",
        url: "/daily-entry",
        icons: [
          {
            src: "/icons/shortcut-entry.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    ],
  };
}
