import { BlogHeadingText, BlogMainText } from "../fonts";

export default function BlogPage() {
  return (
    <div className="py-10 w-full px-5">
      <article className="mx-auto max-w-3xl bg-white">
        <div className="mb-5">
          <h1
            className={`text-5xl font-medium text-gray-800 ${BlogHeadingText.className}`}
          >
            Blog title
          </h1>
        </div>
        <div style={BlogMainText.style} className={"text-gray-800"}>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
            tempor sapien vel est pulvinar condimentum. Nullam ut gravida eros.
            Nunc malesuada sollicitudin ornare. In nec libero at ante malesuada
            mattis. Maecenas sit amet diam lobortis, accumsan quam ut, pulvinar
            ligula. Vestibulum scelerisque varius consectetur. Quisque molestie,
            augue a semper fermentum, sapien nibh auctor mauris, vitae iaculis
            erat metus eget nibh. Donec accumsan massa massa. Integer volutpat
            eu augue sed auctor.
          </p>
        </div>
      </article>
      <footer className="mx-auto mt-10 text-center font-sans text-xs text-gray-400 sm:flex-row sm:gap-0 w-full">
        <p>&copy; 2026 - Lakshya Singh Panwar</p>
      </footer>
    </div>
  );
}
