import { MainText } from "../fonts";

/** Shell is UI type. Prose containers opt into the serif themselves. */
export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`min-h-screen bg-white ${MainText.className}`}>{children}</div>
  );
}
