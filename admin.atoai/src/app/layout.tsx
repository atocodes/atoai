import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AtoAI • Admin Console",
  description: "Knowledge Base, pgvector embeddings, and RAG administration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full flex flex-col bg-[#141414] text-[#F2F0EA] antialiased">
        {children}
      </body>
    </html>
  );
}
