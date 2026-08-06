// components/AdminComponents/Products/ProductForm.tsx

'use client';

import { useActionState, useState } from 'react';

import {
    createProduct,
    type ProductFormState,
} from '@/app/admin/(protected)/products/actions';

import type { PricingRule } from '@/interfaces/Product';

const initialState: ProductFormState = {
    success: false,
    message: '',
};

type PricingRuleForm = {
    id: string;
    min_quantity: string;
    unit_price: string;
};

function createEmptyPricingRule(): PricingRuleForm {
    return {
        id: crypto.randomUUID(),
        min_quantity: '',
        unit_price: '',
    };
}

function currencyStringToNumber(value: string): number {
    const normalizedValue = value
        .trim()
        .replace(/\./g, '')
        .replace(',', '.');

    return Number(normalizedValue);
}

export default function ProductForm() {
    const [state, formAction, pending] = useActionState(
        createProduct,
        initialState,
    );

    const [pricingRules, setPricingRules] = useState<
        PricingRuleForm[]
    >([]);

    function addPricingRule(): void {
        setPricingRules((currentRules) => [
            ...currentRules,
            createEmptyPricingRule(),
        ]);
    }

    function removePricingRule(ruleId: string): void {
        setPricingRules((currentRules) =>
            currentRules.filter(
                (rule) => rule.id !== ruleId,
            ),
        );
    }

    function updatePricingRule(
        ruleId: string,
        field: 'min_quantity' | 'unit_price',
        value: string,
    ): void {
        setPricingRules((currentRules) =>
            currentRules.map((rule) =>
                rule.id === ruleId
                    ? {
                        ...rule,
                        [field]: value,
                    }
                    : rule,
            ),
        );
    }

    const normalizedPricingRules: PricingRule[] =
        pricingRules
            .filter(
                (rule) =>
                    rule.min_quantity.trim() !== '' &&
                    rule.unit_price.trim() !== '',
            )
            .map((rule) => ({
                min_quantity: Number(rule.min_quantity),
                unit_price: currencyStringToNumber(
                    rule.unit_price,
                ),
            }));

    return (
        <form
            action={formAction}
            className="rounded-xl border border-slate-200 bg-white p-6"
        >
            <input
                type="hidden"
                name="pricing_rules"
                value={JSON.stringify(normalizedPricingRules)}
            />

            <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                    <label
                        htmlFor="title"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Nome do produto
                    </label>

                    <input
                        id="title"
                        name="title"
                        type="text"
                        required
                        className="min-h-11 w-full rounded-lg border border-slate-300 px-4 text-slate-900 outline-none transition focus:border-slate-700"
                    />

                    {state.errors?.title && (
                        <p className="mt-1 text-sm text-red-600">
                            {state.errors.title}
                        </p>
                    )}
                </div>

                <div className="md:col-span-2">
                    <label
                        htmlFor="description"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Descrição
                    </label>

                    <textarea
                        id="description"
                        name="description"
                        rows={4}
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-700"
                    />
                </div>

                <div>
                    <label
                        htmlFor="base_price"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Preço base
                    </label>

                    <input
                        id="base_price"
                        name="base_price"
                        type="text"
                        inputMode="decimal"
                        placeholder="1.149,90"
                        required
                        className="min-h-11 w-full rounded-lg border border-slate-300 px-4 text-slate-900 outline-none transition focus:border-slate-700"
                    />

                    {state.errors?.base_price && (
                        <p className="mt-1 text-sm text-red-600">
                            {state.errors.base_price}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="stock"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Estoque
                    </label>

                    <input
                        id="stock"
                        name="stock"
                        type="number"
                        min="0"
                        step="1"
                        defaultValue="0"
                        required
                        className="min-h-11 w-full rounded-lg border border-slate-300 px-4 text-slate-900 outline-none transition focus:border-slate-700"
                    />

                    {state.errors?.stock && (
                        <p className="mt-1 text-sm text-red-600">
                            {state.errors.stock}
                        </p>
                    )}
                </div>

                <div className="md:col-span-2">
                    <label
                        htmlFor="image_url"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        URL da imagem
                    </label>

                    <input
                        id="image_url"
                        name="image_url"
                        type="url"
                        placeholder="https://..."
                        className="min-h-11 w-full rounded-lg border border-slate-300 px-4 text-slate-900 outline-none transition focus:border-slate-700"
                    />

                    {state.errors?.image_url && (
                        <p className="mt-1 text-sm text-red-600">
                            {state.errors.image_url}
                        </p>
                    )}
                </div>

                <div className="md:col-span-2">
                    <label className="flex cursor-pointer items-center gap-3">
                        <input
                            name="active"
                            type="checkbox"
                            defaultChecked
                            className="size-4 rounded border-slate-300"
                        />

                        <span className="text-sm font-medium text-slate-700">
                            Produto ativo e visível na loja
                        </span>
                    </label>
                </div>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-semibold text-slate-900">
                            Preços progressivos
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Defina preços diferentes de acordo
                            com a quantidade comprada.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={addPricingRule}
                        className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Adicionar regra
                    </button>
                </div>

                {pricingRules.length === 0 ? (
                    <div className="mt-5 rounded-lg border border-dashed border-slate-300 p-6 text-center">
                        <p className="text-sm text-slate-500">
                            Nenhuma regra progressiva cadastrada.
                        </p>
                    </div>
                ) : (
                    <div className="mt-5 space-y-4">
                        {pricingRules.map((rule) => (
                            <div
                                key={rule.id}
                                className="grid gap-4 rounded-lg border border-slate-200 p-4 sm:grid-cols-[1fr_1fr_auto]"
                            >
                                <div>
                                    <label
                                        htmlFor={`min_quantity_${rule.id}`}
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        Quantidade mínima
                                    </label>

                                    <input
                                        id={`min_quantity_${rule.id}`}
                                        type="number"
                                        min="2"
                                        step="1"
                                        value={
                                            rule.min_quantity
                                        }
                                        onChange={(event) =>
                                            updatePricingRule(
                                                rule.id,
                                                'min_quantity',
                                                event.target
                                                    .value,
                                            )
                                        }
                                        placeholder="2"
                                        className="min-h-11 w-full rounded-lg border border-slate-300 px-4 text-slate-900 outline-none transition focus:border-slate-700"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor={`unit_price_${rule.id}`}
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        Preço unitário
                                    </label>

                                    <input
                                        id={`unit_price_${rule.id}`}
                                        type="text"
                                        inputMode="decimal"
                                        value={rule.unit_price}
                                        onChange={(event) =>
                                            updatePricingRule(
                                                rule.id,
                                                'unit_price',
                                                event.target
                                                    .value,
                                            )
                                        }
                                        placeholder="1.099,00"
                                        className="min-h-11 w-full rounded-lg border border-slate-300 px-4 text-slate-900 outline-none transition focus:border-slate-700"
                                    />
                                </div>

                                <div className="flex items-end">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removePricingRule(
                                                rule.id,
                                            )
                                        }
                                        className="min-h-11 rounded-lg px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                    >
                                        Remover
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {state.errors?.pricing_rules && (
                    <p className="mt-3 text-sm text-red-600">
                        {state.errors.pricing_rules}
                    </p>
                )}
            </div>

            {state.message && !state.success && (
                <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                    {state.message}
                </div>
            )}

            <div className="mt-8 flex justify-end">
                <button
                    type="submit"
                    disabled={pending}
                    className="min-h-11 rounded-lg bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {pending
                        ? 'Salvando...'
                        : 'Cadastrar produto'}
                </button>
            </div>
        </form>
    );
}