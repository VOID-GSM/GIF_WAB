import { NotFound } from "@repo/ui";
import { Righteous } from "next/font/google";

const righteous = Righteous({
  weight: "400",
  variable: "--font-righteous",
  subsets: ["latin"],
});

export default function AdminNotFound() {
  return (
    <div className={righteous.variable}>
      <NotFound />
    </div>
  );
}
