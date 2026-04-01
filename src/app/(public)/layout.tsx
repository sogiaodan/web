/**
 * Public Layout — no auth guard, no sidebar.
 * Font variables (--font-lora, --font-work-sans) are already injected
 * by the root layout (app/layout.tsx). This layout simply provides the
 * minimal structural wrapper for all public-facing routes (/, /privacy, etc.)
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
