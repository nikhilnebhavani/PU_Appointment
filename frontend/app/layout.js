import { Inter } from "next/font/google";
import "./globals.css";
import Authprovider from '../components/Authprovider/Authprovider';
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PU Appointment",
  description: "Appointment booking website for Parul University.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#ffffff" />

        {/* Define all sizes of the Apple Touch Icons to cover various devices */}
        <link rel="apple-touch-icon" sizes="180x180" href="/calender.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/calender.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/calender.png" />
        <link rel="apple-touch-icon" href="/calender.png" />
      </head>
      <body className={inter.className}>
        <Authprovider>
          {children}
        </Authprovider>
      </body>
    </html>
  );
}
