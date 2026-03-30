import Link from 'next/link';
import { cn } from '@/lib/utils';

export function AuthFooter({ className }: { className?: string }) {
  const links = [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Security Protocol', href: '#' },
  ];

  return (
    <footer
      className={cn(
        'mt-8 flex w-full flex-col items-center justify-center font-sans text-[12px] text-foreground',
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 opacity-80">
        {links.map((link, idx) => (
          <div key={link.label} className="flex items-center gap-x-2">
            <Link
              href={link.href}
              className="transition-colors duration-200 hover:text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              {link.label}
            </Link>
            {idx < links.length - 1 && (
              <span className="text-outline-variant" aria-hidden="true">
                &middot;
              </span>
            )}
          </div>
        ))}
      </div>
    </footer>
  );
}
