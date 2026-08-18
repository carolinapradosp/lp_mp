// components/AdminComponents/Products/ProductForm.tsx

'use client';

import Link from 'next/link';
import {
    useActionState,
    useEffect,
    useRef,
    useState,
} from 'react';

import {
    createProduct,
    type ProductFormState,
    updateProduct,
} from '@/app/admin/(protected)/products/actions';

import type {
    AdminProduct,
    PricingRule,
} from '@/interfaces/Product';
import ProductImageUpload from './ProductImageUpload';

type ProductFormProps = {
    product?: AdminProduct;
};

type PricingRuleForm = {
    id: string;
    min_quantity: string;
    unit_price: string;
};

const initialState: ProductFormState = {
    success: false,
    message: '',
};

function formatCurrencyInput(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function parseCurrencyInput(value: string): number {
    const originalValue = value
        .trim()
        .replace(/\s/g, '');

    if (!originalValue) {
        return Number.NaN;
    }

    if (
        originalValue.includes('.') &&
        originalValue.includes(',')
    ) {
        return Number(
            originalValue
                .replace(/\./g, '')
                .replace(',', '.'),
        );
    }

    if (originalValue.includes(',')) {
        return Number(originalValue.replace(',', '.'));
    }

    return Number(originalValue);
}

function createInitialRules(
    product?: AdminProduct,
): PricingRuleForm[] {
    return (
        product?.pricing_rules.map((rule, index) => ({
            id: `existing-rule-${index}`,
            min_quantity: String(rule.min_quantity),
            unit_price: formatCurrencyInput(
                rule.unit_price,
            ),
        })) ?? []
    );
}

export default function ProductForm({
    product,
}: ProductFormProps) {

    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setHydrated(true);
    }, []);

    const isEditing = Boolean(product);

    const productAction = isEditing
        ? updateProduct
        : createProduct;

    const [state, formAction, pending] = useActionState(
        productAction,
        initialState,
    );

    const nextRuleId = useRef(
        product?.pricing_rules.length ?? 0,
    );

    const [pricingRules, setPricingRules] = useState<
        PricingRuleForm[]
    >(() => createInitialRules(product));

    function addPricingRule(): void {
        nextRuleId.current += 1;

        setPricingRules((currentRules) => [
            ...currentRules,
            {
                id: `new-rule-${nextRuleId.current}`,
                min_quantity: '',
                unit_price: '',
            },
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
                min_quantity: Number(
                    rule.min_quantity,
                ),

                unit_price: parseCurrencyInput(
                    rule.unit_price,
                ),
            }));

    return (
        <form
            action={formAction}
            data-hydrated={hydrated ? 'true' : 'false'}
            className="rounded-xl border border-slate-200 bg-white p-6"
        >
            {product && (
                <>
                    <input
                        type="hidden"
                        name="product_id"
                        value={product.id}
                    />

                    <input
                        type="hidden"
                        name="previous_image_url"
                        value={product.image_url ?? ''}
                    />
                </>
            )}

            <input
                type="hidden"
                name="pricing_rules"
                value={JSON.stringify(
                    normalizedPricingRules,
                )}
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
                        defaultValue={product?.title ?? ''}
                        required
                        className="min-h-11 w-full rounded-xl border border-slate-300 px-4 text-slate-900 outline-none transition focus:border-slate-700"
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
                        defaultValue={
                            product?.description ?? ''
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-700"
                    />

                    {state.errors?.description && (
                        <p className="mt-1 text-sm text-red-600">
                            {state.errors.description}
                        </p>
                    )}
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
                        defaultValue={
                            product
                                ? formatCurrencyInput(
                                    product.base_price,
                                )
                                : ''
                        }
                        placeholder="1.149,90"
                        required
                        className="min-h-11 w-full rounded-xl border border-slate-300 px-4 text-slate-900 outline-none transition focus:border-slate-700"
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
                        defaultValue={product?.stock ?? 0}
                        required
                        className="min-h-11 w-full rounded-xl border border-slate-300 px-4 text-slate-900 outline-none transition focus:border-slate-700"
                    />

                    {state.errors?.stock && (
                        <p className="mt-1 text-sm text-red-600">
                            {state.errors.stock}
                        </p>
                    )}
                </div>

                <div className="md:col-span-2">
                    <ProductImageUpload
                        initialImageUrl={product?.image_url}
                        error={state.errors?.image_url}
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="flex cursor-pointer items-center gap-3">
                        <input
                            name="active"
                            type="checkbox"
                            defaultChecked={
                                product?.active ?? true
                            }
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
                            Defina preços diferentes conforme a
                            quantidade comprada.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={addPricingRule}
                        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Adicionar regra
                    </button>
                </div>

                {pricingRules.length === 0 ? (
                    <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-6 text-center">
                        <p className="text-sm text-slate-500">
                            Nenhuma regra progressiva cadastrada.
                        </p>
                    </div>
                ) : (
                    <div className="mt-5 space-y-4">
                        {pricingRules.map((rule) => (
                            <div
                                key={rule.id}
                                className="grid gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-[1fr_1fr_auto]"
                            >
                                <div>
                                    <label
                                        htmlFor={`min-quantity-${rule.id}`}
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        Quantidade mínima
                                    </label>

                                    <input
                                        id={`min-quantity-${rule.id}`}
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
                                        required
                                        className="min-h-11 w-full rounded-xl border border-slate-300 px-4 text-slate-900 outline-none transition focus:border-slate-700"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor={`unit-price-${rule.id}`}
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        Preço unitário
                                    </label>

                                    <input
                                        id={`unit-price-${rule.id}`}
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
                                        required
                                        className="min-h-11 w-full rounded-xl border border-slate-300 px-4 text-slate-900 outline-none transition focus:border-slate-700"
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
                                        className="min-h-11 rounded-xl px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
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
                <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                    {state.message}
                </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Link
                    href="/admin/products"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    Cancelar
                </Link>

                <button
                    type="submit"
                    disabled={pending}
                    className="min-h-11 rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {pending
                        ? 'Salvando...'
                        : isEditing
                            ? 'Salvar alterações'
                            : 'Cadastrar produto'}
                </button>
            </div>
        </form>
    );
}