import { Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight:["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "You are special!",
  description: "A cute little website filled with compliments, surprises, and a heartfelt message made just for you.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${quicksand.className} bg-black antialiased select-none`}
      >
        {children}
      </body>
    </html>
  );
}
