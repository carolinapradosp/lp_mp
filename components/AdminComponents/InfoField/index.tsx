// components/admin/InfoField.tsx

interface InfoFieldProps {
    label: string;
    value: string;
}

export default function InfoField({
    label,
    value,
}: InfoFieldProps) {
    return (
        <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {label}
            </p>

            <div
                className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    px-5
                    py-4
                    text-sm
                    font-medium
                    text-slate-700
                    shadow-[0_10px_30px_rgba(15,23,42,0.04)]
                "
            >
                {value}
            </div>
        </div>
    );
}