import { NotesFooter } from "@/components/notes/footer";
import { PageNav } from "@/components/notes/page-nav";
import { Sidebar } from "@/components/notes/sidebar";
import { BlogMainText } from "@/app/fonts";

export default function SystemDesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="lg:flex">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <div
          className={`mx-auto max-w-[46rem] px-5 py-10 sm:px-8 sm:py-14 ${BlogMainText.className}`}
        >
          {children}
          <PageNav />
          <NotesFooter />
        </div>
      </main>
    </div>
  );
}
