import logo from '@/public/logo.png';
import Image from "next/image";

export default function Footer() {
    return (
        <footer
            className="
            w-full
        relative
        overflow-hidden
        border-t
        border-blue-100
        bg-linear-to-b
        from-white
        to-blue-50/40
      "
        >
            <div
                className="
          pointer-events-none
          absolute
          left-0
          top-0
          h-40
          w-40
          rounded-full
          bg-blue-500/10
          blur-3xl
        "
            />

            <div
                className="
          pointer-events-none
          absolute
          right-0
          bottom-0
          h-40
          w-40
          rounded-full
          bg-red-500/10
          blur-3xl
        "
            />

            <div
                className="
          relative
          mx-auto
          flex
          w-full
          max-w-480
          flex-col
          items-center
          justify-between
          gap-6
          px-4
          py-10
          text-center
          sm:px-6
          lg:flex-row
          lg:px-10
          lg:text-left
        "
            >
                {/* ESQUERDA */}
                <div>
                    <a href="/">
                        <Image src={logo} alt="Express Pharma" width={120} />
                    </a>

                    <p
                        className="
              mt-2
              max-w-md
              text-sm
              leading-relaxed
              text-slate-600
            "
                    >
                        Entrega rápida,
                        segurança e os melhores produtos.
                    </p>
                </div>

                {/* DIREITA */}
                <div className="flex flex-col items-center gap-4 lg:items-end">
                    <div className="flex items-center gap-3">
                        <span
                            className="
                inline-flex
                items-center
                rounded-full
                border
                border-blue-200
                bg-blue-50
                px-4
                py-2
                text-xs
                font-bold
                uppercase
                tracking-[0.18em]
                text-blue-700
              "
                        >
                            Compra Segura
                        </span>

                        <span
                            className="
                inline-flex
                items-center
                rounded-full
                border
                border-red-200
                bg-red-50
                px-4
                py-2
                text-xs
                font-bold
                uppercase
                tracking-[0.18em]
                text-red-600
              "
                        >
                            Entrega Expressa
                        </span>
                    </div>

                    <p className="text-sm text-slate-500">
                        &copy; {new Date().getFullYear()}{' '}
                        <span className="font-semibold text-slate-700">
                            Express Pharma
                        </span>
                        . Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
}