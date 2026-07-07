'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import MessagePayment from '@/components/MessagePayment';
import { useCartStore } from '@/store/cartStore';
import StatusPayment from '../../enum/StatusPayment';
import { useCheckoutStore } from '@/store/checkoutStore';
import { getPusherClient } from '@/lib/pusher-client';

function OrderConfirmationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { clear } = useCartStore();

    const paymentId = searchParams.get('paymentId');
    const {
        amount,
        status: storedStatus,
        pixData,
    } = useCheckoutStore();

    const [paymentStatus, setPaymentStatus] = useState<StatusPayment>(
        storedStatus || StatusPayment.pending
    );

    const [copied, setCopied] = useState(false);
    const [paymentError, setPaymentError] = useState('');

    const handleCopyPix = () => {
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 3000);
    };

    useEffect(() => {
        if (!paymentId) return;

        const pusherClient = getPusherClient();
        const channel = pusherClient.subscribe(`payment-${paymentId}`);

        channel.bind(
            'payment-status-updated',
            (data: { status: StatusPayment }) => {
                setPaymentStatus(data.status);

                if (data.status === StatusPayment.approved) {
                    clear();
                }
            }
        );

        return () => {
            channel.unbind_all();
            pusherClient.unsubscribe(`payment-${paymentId}`);
        };
    }, [paymentId, clear]);

    useEffect(() => {
        if (!paymentId) return;

        let isFinished = false;

        const interval = setInterval(async () => {
            try {
                const response = await fetch(
                    `/api/payment-status?paymentId=${paymentId}`
                );
                const data = await response.json();

                if (!data?.status) return;

                setPaymentStatus(data.status);

                if (data.status === StatusPayment.approved) {
                    clear();
                    isFinished = true;
                    clearInterval(interval);
                }

                if (
                    data.status === StatusPayment.rejected ||
                    data.status === StatusPayment.cancelled
                ) {
                    isFinished = true;
                    clearInterval(interval);
                }
            } catch (err) {
                console.error('Erro polling pagamento:', err);
            }
        }, 5000);

        return () => {
            if (!isFinished) {
                clearInterval(interval);
            }
        };
    }, [paymentId, clear]);

    useEffect(() => {
        if (!paymentId) {
            router.push('/');
        }
    }, [paymentId, router]);

    if (!paymentId) {
        return null;
    }


    console.log('teste order confirmation', {
        amountFromStore: amount,
        status: storedStatus,
    });

    return (
        <main className="min-h-screen bg-white px-4 py-16 flex items-center justify-center">
            <div className="w-full max-w-2xl">

                {/* CABEÇALHO EDITORIAL */}
                <div className="mb-12 text-center">
                    <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-muted)]">
                        Status do Pedido
                    </span>

                    <h1 className="text-3xl font-bold tracking-tight text-[var(--color-brand-dark)] sm:text-4xl">
                        Confirmação de Compra
                    </h1>

                    <p className="mt-3 text-sm text-[var(--color-brand-muted)]">
                        O seu pagamento está sendo processado de forma segura.
                        Acompanhe a atualização do status em tempo real abaixo.
                    </p>
                </div>

                {/* CONTAINER PRINCIPAL CONTAINER PLANO */}
                <div className="border border-[var(--color-brand-border)] bg-white p-6 sm:p-10">
                    <MessagePayment
                        type={paymentStatus}
                        amount={amount}
                        copied={copied}
                        orderId={paymentId}
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
                <main className="min-h-screen bg-white flex items-center justify-center px-4">
                    <div className="border border-[var(--color-brand-border)] bg-white p-8 w-full max-w-sm text-center">
                        <div className="flex flex-col items-center">
                            {/* Spinner minimalista de linha fina */}
                            <div className="mb-4 h-8 w-8 animate-spin border-2 border-[var(--color-brand-border)] border-t-[var(--color-brand-dark)]" />

                            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-dark)]">
                                Carregando informações...
                            </p>
                            <span className="mt-1 text-xs text-[var(--color-brand-muted)]">
                                Sincronizando com o gateway de pagamento.
                            </span>
                        </div>
                    </div>
                </main>
            }
        >
            <OrderConfirmationContent />
        </Suspense>
    );
}