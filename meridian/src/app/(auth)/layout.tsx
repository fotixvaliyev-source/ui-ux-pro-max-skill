import { Blob } from "@/components/brand/blob";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-12">
      <div aria-hidden className="dot-grid absolute inset-0 -z-10 [mask-image:radial-gradient(circle,black,transparent_75%)]" />
      <Blob tone="library" className="-left-32 -top-24 -z-10 h-96 w-96" />
      <Blob tone="directory" shape={1} className="-bottom-28 -right-24 -z-10 h-96 w-96" />
      <Logo className="mb-8" />
      <main className="w-full max-w-md">{children}</main>
    </div>
  );
}
