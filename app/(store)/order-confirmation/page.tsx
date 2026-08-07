// app/(store)/order-confirmation/page.tsx

'use client';

import {
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import MessagePayment from '@/components/MessagePayment';
import StatusPayment from '@/enum/StatusPayment';
import type {
    OrderConfirmationData,
    OrderConfirmationError,
} from '@/lib/orders/order-confirmation';
import { getPusherClient } from '@/lib/pusher-client';
import { useCartStore } from '@/store/cartStore';
import { useCheckoutStore } from '@/store/checkoutStore';

const POLLING_INTERVAL = 5_000;

const FINAL_PAYMENT_STATUSES = new Set<StatusPayment>([
    StatusPayment.approved,
    StatusPayment.rejected,
    StatusPayment.cancelled,
    StatusPayment.refunded,
    StatusPayment.charged_back,
]);

function OrderConfirmationLoading() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-white px-4">
            <div className="w-full max-w-sm border border-brand-border bg-white p-8 text-center">
                <div className="flex flex-col items-center">
                    <div className="mb-4 h-8 w-8 animate-spin border-2 border-brand-border border-t-[var(--color-brand-dark)]" />

                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-dark)]">
                        Carregando informações...
                    </p>

                    <span className="mt-1 text-xs text-[var(--color-brand-muted)]">
                        Consultando os dados do seu pedido.
                    </span>
                </div>
            </div>
        </main>
    );
}

function OrderConfirmationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { clear } = useCartStore();

    const {
        hydrated,
        confirmationToken: storedConfirmationToken,
        paymentId: storedPaymentId,
        externalReference: storedExternalReference,
        amount: storedAmount,
        status: storedStatus,
        pixData: storedPixData,
        setCheckoutData,
    } = useCheckoutStore();

    const tokenFromUrl =
        searchParams.get('token')?.trim() || null;

    const confirmationToken =
        tokenFromUrl || storedConfirmationToken;

    const storedPixDataRef = useRef(storedPixData);
    const requestInProgressRef = useRef(false);
    const cartClearedRef = useRef(false);

    const [confirmationData, setConfirmationData] =
        useState<OrderConfirmationData | null>(null);

    const [paymentStatus, setPaymentStatus] =
        useState<StatusPayment>(
            storedStatus || StatusPayment.pending
        );

    const [loading, setLoading] = useState(true);
    const [paymentError, setPaymentError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        storedPixDataRef.current = storedPixData;
    }, [storedPixData]);

    const paymentId =
        confirmationData?.paymentId || storedPaymentId;

    const externalReference =
        confirmationData?.externalReference ||
        storedExternalReference;

    const amount =
        confirmationData?.amount ?? storedAmount;

    const pixData = useMemo(() => {
        const qrCode =
            confirmationData?.pixData?.qrCode ||
            storedPixData?.qrCode;

        if (!qrCode) {
            return undefined;
        }

        return {
            qrCode,
            qrCodeBase64:
                storedPixData?.qrCodeBase64,
            expirationAt:
                confirmationData?.pixData?.expirationAt ??
                storedPixData?.expirationAt ??
                null,
        };
    }, [
        confirmationData?.pixData,
        storedPixData,
    ]);

    const handleCopyPix = useCallback(() => {
        setCopied(true);

        window.setTimeout(() => {
            setCopied(false);
        }, 3_000);
    }, []);

    const loadOrderConfirmation =
        useCallback(async (): Promise<OrderConfirmationData | null> => {
            if (
                !confirmationToken ||
                requestInProgressRef.current
            ) {
                return null;
            }

            requestInProgressRef.current = true;

            try {
                const response = await fetch(
                    `/api/orders/status?token=${encodeURIComponent(
                        confirmationToken
                    )}`,
                    {
                        method: 'GET',
                        cache: 'no-store',
                    }
                );

                const body = (await response.json()) as
                    | OrderConfirmationData
                    | OrderConfirmationError;

                if (!response.ok) {
                    const errorBody =
                        body as OrderConfirmationError;

                    throw new Error(
                        errorBody.error ||
                        'Não foi possível consultar o pedido.'
                    );
                }

                const data =
                    body as OrderConfirmationData;

                setConfirmationData(data);
                setPaymentStatus(data.status);
                setPaymentError('');

                const currentStoredPixData =
                    storedPixDataRef.current;

                const qrCode =
                    data.pixData?.qrCode ||
                    currentStoredPixData?.qrCode;

                /*
                 * O tipo do store exige paymentId como string.
                 * Por isso, atualizamos o store somente quando
                 * a API já tiver retornado um paymentId válido.
                 */
                if (data.paymentId) {
                    setCheckoutData({
                        paymentId: data.paymentId,
                        externalReference:
                            data.externalReference,
                        confirmationToken,
                        amount: data.amount,
                        status: data.status,

                        pixData: qrCode
                            ? {
                                qrCode,
                                qrCodeBase64:
                                    currentStoredPixData
                                        ?.qrCodeBase64,
                                expirationAt:
                                    data.pixData?.expirationAt ??
                                    currentStoredPixData
                                        ?.expirationAt ??
                                    null,
                            }
                            : undefined,
                    });
                }

                return data;
            } catch (error) {
                console.error(
                    'Erro ao consultar confirmação do pedido:',
                    error
                );

                setPaymentError(
                    error instanceof Error
                        ? error.message
                        : 'Não foi possível consultar o pedido.'
                );

                return null;
            } finally {
                requestInProgressRef.current = false;
            }
        }, [
            confirmationToken,
            setCheckoutData,
        ]);

    useEffect(() => {
        if (!hydrated) {
            return;
        }

        if (!confirmationToken) {
            router.replace('/');
        }
    }, [
        hydrated,
        confirmationToken,
        router,
    ]);

    useEffect(() => {
        if (
            !hydrated ||
            !confirmationToken
        ) {
            return;
        }

        let active = true;

        async function loadInitialData() {
            setLoading(true);

            await loadOrderConfirmation();

            if (active) {
                setLoading(false);
            }
        }

        void loadInitialData();

        return () => {
            active = false;
        };
    }, [
        hydrated,
        confirmationToken,
        loadOrderConfirmation,
    ]);

    useEffect(() => {
        if (
            paymentStatus !== StatusPayment.approved ||
            cartClearedRef.current
        ) {
            return;
        }

        cartClearedRef.current = true;
        clear();
    }, [
        paymentStatus,
        clear,
    ]);

    useEffect(() => {
        if (!paymentId) {
            return;
        }

        const pusherClient =
            getPusherClient();

        const channelName =
            `payment-${paymentId}`;

        const channel =
            pusherClient.subscribe(channelName);

        const handleStatusUpdated = (
            data: {
                status?: StatusPayment;
            }
        ) => {
            if (!data.status) {
                return;
            }

            const nextStatus = data.status;

            setPaymentStatus(nextStatus);

            setConfirmationData((current) => {
                if (!current) {
                    return current;
                }

                return {
                    ...current,
                    status: nextStatus,
                };
            });

            /*
             * O método do store exige os demais campos.
             * Portanto, só atualizamos por completo quando
             * já temos dados suficientes da confirmação.
             */
            if (
                confirmationToken &&
                externalReference
            ) {
                setCheckoutData({
                    paymentId,
                    externalReference,
                    confirmationToken,
                    amount,
                    status: nextStatus,
                    pixData,
                });
            }
        };

        channel.bind(
            'payment-status-updated',
            handleStatusUpdated
        );

        return () => {
            channel.unbind(
                'payment-status-updated',
                handleStatusUpdated
            );

            pusherClient.unsubscribe(channelName);
        };
    }, [
        paymentId,
        confirmationToken,
        externalReference,
        amount,
        pixData,
        setCheckoutData,
    ]);

    useEffect(() => {
        if (
            !confirmationToken ||
            FINAL_PAYMENT_STATUSES.has(
                paymentStatus
            )
        ) {
            return;
        }

        let cancelled = false;

        let timeoutId: number | undefined;

        const poll = async () => {
            if (cancelled) {
                return;
            }

            const data =
                await loadOrderConfirmation();

            if (
                cancelled ||
                (
                    data &&
                    FINAL_PAYMENT_STATUSES.has(
                        data.status
                    )
                )
            ) {
                return;
            }

            timeoutId =
                window.setTimeout(
                    poll,
                    POLLING_INTERVAL
                );
        };

        timeoutId =
            window.setTimeout(
                poll,
                POLLING_INTERVAL
            );

        return () => {
            cancelled = true;

            if (timeoutId !== undefined) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [
        confirmationToken,
        paymentStatus,
        loadOrderConfirmation,
    ]);

    if (!hydrated || loading) {
        return (
            <OrderConfirmationLoading />
        );
    }

    if (!confirmationToken) {
        return null;
    }

    if (
        paymentError &&
        !confirmationData &&
        !paymentId
    ) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white px-4 py-16">
                <div className="w-full max-w-lg border border-brand-border bg-white p-8 text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-[var(--color-brand-dark)]">
                        Não foi possível carregar o pedido
                    </h1>

                    <p className="mt-4 text-sm leading-relaxed text-[var(--color-brand-muted)]">
                        {paymentError}
                    </p>

                    <button
                        type="button"
                        onClick={() => {
                            setPaymentError('');
                            setLoading(true);

                            void loadOrderConfirmation()
                                .finally(() => {
                                    setLoading(false);
                                });
                        }}
                        className="mt-8 w-full cursor-pointer bg-[var(--color-brand-dark)] px-6 py-4 text-xs font-semibold uppercase tracking-widest text-white transition-colors duration-200 hover:bg-neutral-800"
                    >
                        Tentar novamente
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            router.replace('/');
                        }}
                        className="mt-3 w-full cursor-pointer border border-brand-border px-6 py-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-muted)] transition-colors duration-200 hover:border-[var(--color-brand-dark)] hover:text-[var(--color-brand-dark)]"
                    >
                        Voltar para a loja
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-white px-4 py-16">
            <div className="w-full max-w-2xl">
                <div className="mb-12 text-center">
                    <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-muted)]">
                        Status do Pedido
                    </span>

                    <h1 className="text-3xl font-bold tracking-tight text-[var(--color-brand-dark)] sm:text-4xl">
                        Confirmação de Compra
                    </h1>

                    <p className="mt-3 text-sm text-[var(--color-brand-muted)]">
                        Acompanhe abaixo o status atualizado do seu pagamento.
                    </p>
                </div>

                <div className="border border-brand-border bg-white p-6 sm:p-10">
                    <MessagePayment
                        type={paymentStatus}
                        amount={amount}
                        copied={copied}
                        orderId={
                            externalReference ||
                            confirmationData?.orderId ||
                            ''
                        }
                        errorMessage={paymentError}
                        onCopyPix={handleCopyPix}
                        pixData={pixData}
                    />
                </div>
            </div>
        </main>
    );
}

export default function OrderConfirmationPage() {
    return (
        <Suspense
            fallback={
                <OrderConfirmationLoading />
            }
        >
            <OrderConfirmationContent />
        </Suspense>
    );
}