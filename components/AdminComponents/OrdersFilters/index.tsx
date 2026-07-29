import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { Filters } from "@/interfaces/Filters";
import { Search } from "lucide-react";

interface OrdersFiltersProps {
    filters: Filters;
    setFilters: Dispatch<SetStateAction<Filters>>;
    onSearch: () => void;
    onClear: () => void;
}

const inputClass = `
  h-14
  w-full
  rounded-2xl
  border border-neutral-200
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

export default function OrdersFilters({
    filters,
    setFilters,
    onSearch,
    onClear,
}: OrdersFiltersProps) {
    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSearch();
    }

    function updateFilter<Key extends keyof Filters>(
        key: Key,
        value: Filters[Key],
    ) {
        setFilters((previousFilters) => ({
            ...previousFilters,
            [key]: value,
        }));
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 xl:grid-cols-6"
        >
            <SearchField
                id="order-id"
                label="ID do pedido"
                placeholder="Buscar por ID"
                value={filters.orderId}
                onChange={(value) => updateFilter("orderId", value)}
            />

            <SearchField
                id="customer-cpf"
                label="CPF do cliente"
                placeholder="Buscar por CPF"
                value={filters.cpf}
                onChange={(value) => updateFilter("cpf", value)}
            />

            <div className="xl:col-span-2">
                <SearchField
                    id="customer-email"
                    label="E-mail do cliente"
                    placeholder="Buscar por e-mail"
                    value={filters.email}
                    onChange={(value) => updateFilter("email", value)}
                />
            </div>

            <div>
                <label htmlFor="order-status" className="sr-only">
                    Status do pedido
                </label>

                <select
                    id="order-status"
                    value={filters.status}
                    onChange={(event) =>
                        updateFilter("status", event.target.value)
                    }
                    className={inputClass}
                >
                    <option value="">Todos os status</option>
                    <option value="approved">Aprovado</option>
                    <option value="pending">Pendente</option>
                    <option value="in_process">Em processamento</option>
                    <option value="rejected">Recusado</option>
                    <option value="cancelled">Cancelado</option>
                    <option value="refunded">Reembolsado</option>
                    <option value="charged_back">Contestado</option>
                </select>
            </div>

            <div className="flex gap-3">
                <button
                    type="submit"
                    className="
            h-14 flex-1 rounded-2xl
            bg-blue-600 px-6
            text-sm font-bold text-white
            transition-all
            hover:bg-blue-700
            hover:shadow-[0_10px_25px_rgba(37,99,235,0.25)]
          "
                >
                    Buscar
                </button>

                <button
                    type="button"
                    onClick={onClear}
                    className="
            h-14 rounded-2xl
            border border-neutral-200
            bg-white px-6
            text-sm font-bold text-neutral-700
            transition-all hover:bg-neutral-100
          "
                >
                    Limpar
                </button>
            </div>
        </form>
    );
}

interface SearchFieldProps {
    id: string;
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
}

function SearchField({
    id,
    label,
    placeholder,
    value,
    onChange,
}: SearchFieldProps) {
    return (
        <div className="relative">
            <label htmlFor={id} className="sr-only">
                {label}
            </label>

            <Search
                aria-hidden="true"
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
                id={id}
                type="search"
                placeholder={placeholder}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={`${inputClass} pl-11`}
            />
        </div>
    );
}