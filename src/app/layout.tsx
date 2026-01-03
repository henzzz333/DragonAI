import "./globals.css";
import { Open_Sans } from "next/font/google";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-open-sans",
});

export const metadata = {
  title: "Dragon AI",
  description: "Research-focused academic AI assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={openSans.variable}>
      <head>
        {/* Puter.js Browser SDK (client-side only) */}
        <script src="https://js.puter.com/v2/"></script>
      </head>
      <body className="font-sans bg-white text-black">
        {children}
      </body>
    </html>
  );
}
