// components/admin/ResumeLine.tsx

interface ResumeLineProps {
    label: string;
    value: number;
}

export default function ResumeLine({
    label,
    value,
}: ResumeLineProps) {
    return (
        <div
            className="
                flex
                items-center
                justify-between
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-4
                py-3
            "
        >
            <p className="text-sm font-medium text-slate-500">
                {label}
            </p>

            <p className="text-sm font-bold text-slate-900">
                {value.toLocaleString(
                    'pt-BR',
                    {
                        style: 'currency',
                        currency: 'BRL',
                    }
                )}
            </p>
        </div>
    );
}