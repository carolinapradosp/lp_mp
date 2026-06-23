import logo from '@/public/logo.jpg';
import Image from "next/image";
import Logo from '../Logo/Logo';

export default function Footer() {
    return (
        <footer className="w-full border-t border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)] transition-colors duration-300">
            <div className="mx-auto flex w-full max-w-480 flex-col items-center justify-between gap-8 px-4 py-12 text-center sm:px-6 lg:flex-row lg:px-8 lg:py-16 lg:text-left">

                {/* ESQUERDA - Branding & Descrição */}
                <div className="flex flex-col items-center lg:items-start">
                    <Logo />

                    <p className="mt-4 max-w-xs text-xs leading-relaxed tracking-wide text-[var(--color-brand-muted)]">
                        Entrega rápida, segurança e os melhores produtos selecionados para o seu negócio.
                    </p>
                </div>

                {/* DIREITA - Selos de Confiança Muted & Copyright */}
                <div className="flex flex-col items-center gap-5 lg:items-end">

                    {/* Selos minimalistas com bordas retas alinhadas ao tema */}
                    <div className="flex flex-wrap justify-center gap-3">
                        <span className="border border-[var(--color-brand-border)] bg-white px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest text-[var(--color-brand-dark)]">
                            Compra Segura
                        </span>

                        <span className="border border-[var(--color-brand-border)] bg-white px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest text-[var(--color-brand-accent)]">
                            Entrega Expressa
                        </span>
                    </div>

                    {/* Copyright */}
                    <p className="text-[11px] tracking-wide text-[var(--color-brand-muted)]">
                        &copy; {new Date().getFullYear()}{' '}
                        <span className="font-medium text-[var(--color-brand-dark)]">
                            LP MP
                        </span>
                        . Todos os direitos reservados.
                    </p>
                </div>

            </div>
        </footer>
    );
}