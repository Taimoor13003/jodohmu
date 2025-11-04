import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 p-6 md:py-12 w-full">
      <div className="container max-w-7xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 text-sm">
        <div className="grid gap-1">
          <h3 className="font-semibold">Jodohmu</h3>
          <p className="text-gray-500 dark:text-gray-400">Find your soulmate.</p>
        </div>
        <div className="grid gap-1">
          <h3 className="font-semibold">Legal</h3>
          <Link href="#">Privacy Policy</Link>
          <Link href="#">Terms of Service</Link>
        </div>
        <div className="grid gap-1">
          <h3 className="font-semibold">Social</h3>
          <Link href="#">Facebook</Link>
          <Link href="#">Instagram</Link>
          <Link href="#">Twitter</Link>
        </div>
      </div>
    </footer>
  );
}
