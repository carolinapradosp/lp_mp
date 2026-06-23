import Link from "next/link";

// components/Logo.tsx
export default function Logo() {
    return (
        <Link href="/" className="flex items-center">
            <div className="flex items-center gap-4 select-none pointer-events-none">
                {/* Emblema Geométrico */}
                <div className="flex items-center justify-center border border-[var(--color-brand-dark)] px-2.5 py-1 text-[11px] font-light tracking-[0.2em] text-[var(--color-brand-dark)] uppercase">
                    LP
                </div>

                {/* Divisor Cirúrgico */}
                <div className="h-4 w-px bg-neutral-300" />

                {/* Assinatura Nominal */}
                <span className="text-xs font-medium tracking-[0.35em] text-[var(--color-brand-dark)] uppercase">
                    MP
                </span>
            </div>
        </Link>
    );
}