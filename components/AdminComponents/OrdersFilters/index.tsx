// components/admin/OrdersFilters.tsx

import { Filters } from '@/interfaces/Filters';
import { Search } from 'lucide-react';

interface OrdersFiltersProps {
    filters: Filters;
    setFilters: React.Dispatch<
        React.SetStateAction<Filters>
    >;
    onSearch: () => void;
    onClear: () => void;
}

export default function OrdersFilters({
    filters,
    setFilters,
    onSearch,
    onClear,
}: OrdersFiltersProps) {

    const inputClass = `
        h-14
        w-full
        rounded-2xl
        border
        border-neutral-200
        bg-[#f8fafc]
        px-4
        text-neutral-900
        outline-none
        transition-all
        placeholder:text-neutral-400
        focus:border-blue-500
        focus:bg-white
        focus:ring-4
        focus:ring-blue-500/10
    `;

    return (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-6">
            <div className="relative">
                <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                    type="text"
                    placeholder="Buscar por ID"
                    value={filters.orderId}
                    onChange={(e) =>
                        setFilters((prev) => ({
                            ...prev,
                            orderId: e.target.value,
                        }))
                    }
                    className={`${inputClass} pl-11`}
                />
            </div>

            {/* CPF */}
            <div className="relative">
                <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                />

                <input
                    type="text"
                    placeholder="Buscar por CPF"
                    value={filters.cpf}
                    onChange={(e) =>
                        setFilters((prev) => ({
                            ...prev,
                            cpf: e.target.value,
                        }))
                    }
                    className={`${inputClass} pl-11`}
                />
            </div>

            {/* EMAIL */}
            <div className="relative xl:col-span-2">
                <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                />

                <input
                    type="text"
                    placeholder="Buscar por e-mail"
                    value={filters.email}
                    onChange={(e) =>
                        setFilters((prev) => ({
                            ...prev,
                            email: e.target.value,
                        }))
                    }
                    className={`${inputClass} pl-11`}
                />
            </div>

            {/* STATUS */}
            <select
                value={filters.status}
                onChange={(e) =>
                    setFilters((prev) => ({
                        ...prev,
                        status: e.target.value,
                    }))
                }
                className={inputClass}
            >
                <option value="">
                    Todos status
                </option>

                <option value="approved">
                    Aprovado
                </option>

                <option value="pending">
                    Pendente
                </option>

                <option value="in_process">
                    Em Processamento
                </option>

                <option value="rejected">
                    Recusado
                </option>

                <option value="cancelled">
                    Cancelado
                </option>

                <option value="refunded">
                    Reembolsado
                </option>

                <option value="charged_back">
                    Contestado
                </option>
            </select>

            {/* AÇÕES */}
            <div className="flex gap-3">

                <button
                    onClick={onSearch}
                    className="
                        h-14
                        flex-1
                        rounded-2xl
                        bg-blue-600
                        px-6
                        text-sm
                        font-bold
                        text-white
                        transition-all
                        hover:bg-blue-700
                        hover:shadow-[0_10px_25px_rgba(37,99,235,0.25)]
                    "
                >
                    Buscar
                </button>

                <button
                    onClick={onClear}
                    className="
                        h-14
                        rounded-2xl
                        border
                        border-neutral-200
                        bg-white
                        px-6
                        text-sm
                        font-bold
                        text-neutral-700
                        transition-all
                        hover:bg-neutral-100
                    "
                >
                    Limpar
                </button>

            </div>

        </div>
    );
}