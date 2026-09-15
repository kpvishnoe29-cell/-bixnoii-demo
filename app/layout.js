import "./globals.css";

export const metadata = {
  title: "BIXNOII",
  description: "Ecommerce Business Manager",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
