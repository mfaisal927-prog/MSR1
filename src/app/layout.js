import { Noto_Sans_Arabic, Noto_Nastaliq_Urdu, Inter, Poppins, Roboto } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: '--font-noto-sans-arabic',
});

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: '--font-noto-nastaliq',
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: '--font-poppins',
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: '--font-roboto',
});

export const metadata = {
  title: "Malik Sajawal Refreshment - Daily Accounting",
  description: "Daily accounting app - Premium Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ur" dir="rtl" data-theme="light" suppressHydrationWarning>
      <body className={`${notoSansArabic.variable} ${notoNastaliqUrdu.variable} ${inter.variable} ${poppins.variable} ${roboto.variable}`} suppressHydrationWarning>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
