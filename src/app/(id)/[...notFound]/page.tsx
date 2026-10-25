import { notFound } from "next/navigation";

// With two root layouts there is no app-level not-found, so unknown URLs land
// here and render (id)/not-found.tsx inside the site header and footer.
export default function CatchAll() {
  notFound();
}
