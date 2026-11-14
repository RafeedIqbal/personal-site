import { Archivo, Chivo_Mono } from "next/font/google";
import "./publicus.css";

const text = Archivo({ subsets: ["latin"], display: "swap", axes: ["wdth"], variable: "--font-publicus-text" });
const data = Chivo_Mono({ subsets: ["latin"], display: "swap", variable: "--font-publicus-data" });

export default function PublicusLayout({ children }: { children: React.ReactNode }) {
  return <div className={`publicus ${text.variable} ${data.variable}`}>{children}</div>;
}
