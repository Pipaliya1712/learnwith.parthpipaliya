import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Separator className="mb-6" />
        <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {APP_NAME}{" "}
            <Link
              href="https://parthpipaliya.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline-offset-4 transition-colors hover:text-blue-600 hover:underline dark:hover:text-blue-400"
            >
              Parth Pipaliya
            </Link>
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
