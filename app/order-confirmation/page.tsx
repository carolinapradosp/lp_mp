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

    const [paymentStatus, setPaymentStatus] =
        useState<StatusPayment>(
            storedStatus || StatusPayment.pending
        );

    const [copied, setCopied] = useState(false);

    const [paymentError, setPaymentError] =
        useState('');

    const handleCopyPix = () => {
        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 3000);
    };

    useEffect(() => {
        if (!paymentId) return;

        const pusherClient = getPusherClient();

        const channel = pusherClient.subscribe(
            `payment-${paymentId}`
        );

        channel.bind(
            'payment-status-updated',
            (data: {
                status: StatusPayment;
            }) => {

                setPaymentStatus(data.status);

                if (
                    data.status ===
                    StatusPayment.approved
                ) {
                    clear();
                }
            }
        );

        return () => {
            channel.unbind_all();

            pusherClient.unsubscribe(
                `payment-${paymentId}`
            );
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

                // LIMPA CARRINHO
                if (
                    data.status === StatusPayment.approved
                ) {
                    clear();

                    isFinished = true;

                    clearInterval(interval);
                }

                // TERMINA POLLING EM STATUS FINAL
                if (
                    data.status === StatusPayment.rejected ||
                    data.status === StatusPayment.cancelled
                ) {
                    isFinished = true;

                    clearInterval(interval);
                }

            } catch (err) {
                console.error(
                    'Erro polling pagamento:',
                    err
                );
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

    return (
        <main className="min-h-screen bg-linear-to-b from-[#f8fbff] to-white px-4 py-10 flex items-center justify-center">

            <div className="mx-auto w-full max-w-3xl">

                {/* TOPO */}
                <div className="mb-8 text-center">

                    <span className="mb-4 inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                        Pedido realizado
                    </span>

                    <h1 className="text-5xl font-black tracking-tight text-neutral-900">
                        Confirmação do pedido
                    </h1>

                    <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-neutral-500">
                        Estamos processando o seu pagamento.
                        Você pode acompanhar o status abaixo.
                    </p>

                </div>

                {/* CARD */}
                <div className="overflow-hidden rounded-[36px] border border-neutral-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.08)]">

                    {/* GRADIENT */}
                    <div className="h-2 w-full bg-linear-to-r from-blue-600 via-indigo-500 to-violet-500" />

                    <div className="p-6 sm:p-10">

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

            </div>

        </main>
    );
}

export default function OrderConfirmationPage() {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen bg-linear-to-b from-[#f8fbff] to-white flex items-center justify-center px-4">

                    <div className="rounded-4xl border border-neutral-200 bg-white px-10 py-8 shadow-lg">

                        <div className="flex flex-col items-center">

                            <div className="mb-5 h-14 w-14 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

                            <p className="text-lg font-bold text-neutral-900">
                                Carregando pedido...
                            </p>

                            <span className="mt-2 text-sm text-neutral-500">
                                Aguarde alguns instantes
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