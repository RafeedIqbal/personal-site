import { Manrope, Public_Sans } from "next/font/google";
import "./publicus.css";

const display = Manrope({ subsets: ["latin"], display: "swap", variable: "--font-publicus-display" });
const body = Public_Sans({ subsets: ["latin"], display: "swap", variable: "--font-publicus-body" });

export default function PublicusLayout({ children }: { children: React.ReactNode }) {
  return <div className={`publicus ${display.variable} ${body.variable}`}>{children}</div>;
}
