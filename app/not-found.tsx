export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-6 px-4 text-center">
            <h1 className="text-6xl font-bold text-black">
                404
            </h1>

            <p className="text-black-800 text-lg">
                Ops! A página que você está procurando não foi encontrada.
            </p>
            <a href="/" className="text-sm text-blue-500 hover:underline">
                Voltar para a página inicial
            </a>
        </div>
    );
}