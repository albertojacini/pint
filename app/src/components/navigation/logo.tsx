import { Link } from "@/i18n/navigation";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
      <div className="w-8 h-8 rounded-full bg-gray-300" />
      <span className="text-xl font-bold">Pint</span>
    </Link>
  );
}
