// components/PaymentBrick.tsx
'use client';

import { useEffect, useRef } from 'react';
import { loadMercadoPago } from '@mercadopago/sdk-js';
import { apiFetch } from '@/services/api';
import StatusPayment from '@/enum/StatusPayment';

declare global {
    interface Window {
        MercadoPago: new (
            publicKey: string,
            options?: { locale?: string }
        ) => any;
    }
}

type Product = {
    id: string;
    title: string;
    quantity: number;
    price: number;
};

type Props = {
    amount: number;
    products: Product[];
    shippingCost: number;
    user: {
        orderId: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        cpf: string;
        address: {
            zipCode: string;
            federalUnit: string;
            city: string;
            neighborhood: string;
            streetName: string;
            streetNumber: string;
            complement: string;
        };
    };
    onStatusChange: (data: {
        status: StatusPayment;
        paymentId?: string;
        pixData?: any;
        errorMessage?: string;
    }) => void;
    setLoading: (loading: boolean) => void;
};

export default function PaymentBrick({
    amount,
    products,
    user,
    onStatusChange,
    setLoading,
    shippingCost,
}: Props) {
    const mpInstance = useRef<any>(null);
    const brickController = useRef<any>(null);
    const initialized = useRef(false);
    const amountRef = useRef(amount);
    const userRef = useRef(user);

    useEffect(() => { userRef.current = user; }, [user]);
    useEffect(() => { amountRef.current = amount; }, [amount]);

    const initPaymentBrick = async () => {
        if (initialized.current || brickController.current) return;

        const container = document.getElementById('paymentCardBrick_container');
        if (!container || container.childElementCount > 0) return;

        try {
            initialized.current = true;
            await loadMercadoPago();

            if (!mpInstance.current) {
                mpInstance.current = new window.MercadoPago(
                    process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!,
                    { locale: 'pt-BR' }
                );
            }

            const bricksBuilder = mpInstance.current.bricks();

            brickController.current = await bricksBuilder.create(
                'payment',
                'paymentCardBrick_container',
                {
                    initialization: {
                        amount: Number(amountRef.current),
                        payer: { email: user.email },
                    },
                    customization: {
                        paymentMethods: {
                            bankTransfer: 'all',
                            creditCard: 'all',
                            maxInstallments: 12,
                        },
                        visual: {
                            style: { theme: 'light' },
                            hideFormTitle: true,
                        },
                    },
                    callbacks: {
                        onReady: () => {
                            // Desativa o loading inicial da página quando o Mercado Pago está pronto
                            setLoading(false);
                        },
                        onSubmit: async ({ formData }: any) => {
                            // 🚀 Ativa o loading quando o usuário clica em "Pagar"
                            setLoading(true);

                            const isValid = (window as any).validateCheckoutForm?.();

                            if (!isValid) {
                                setLoading(false); // Desativa se o formulário for inválido
                                onStatusChange({
                                    status: StatusPayment.rejected,
                                    errorMessage: 'Preencha os campos obrigatórios.',
                                });
                                return;
                            }

                            const currentUser = userRef.current;
                            const payload = {
                                ...formData,
                                transaction_amount: Number(amountRef.current),
                                products,
                                shippingCost,
                                orderId: currentUser?.orderId,
                                payer: {
                                    ...formData.payer,
                                    first_name: currentUser?.firstName,
                                    last_name: currentUser?.lastName,
                                    email: currentUser?.email,
                                    address: {
                                        zip_code: currentUser?.address?.zipCode,
                                        federal_unit: currentUser?.address?.federalUnit,
                                        city: currentUser?.address?.city,
                                        neighborhood: currentUser?.address?.neighborhood,
                                        street_name: currentUser?.address?.streetName,
                                        street_number: currentUser?.address?.streetNumber,
                                    }
                                },
                                customer: {
                                    firstName: currentUser?.firstName,
                                    lastName: currentUser?.lastName,
                                    email: currentUser?.email,
                                    phone: currentUser?.phone,
                                    identification: {
                                        type: 'CPF',
                                        number: currentUser?.cpf.replace(/\D/g, ''),
                                    },
                                    address: currentUser?.address,
                                },
                            };

                            return apiFetch('/api/payments', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(payload),
                            })
                                .then((res) => {
                                    if (res.id) {
                                        onStatusChange({
                                            status: res.status,
                                            paymentId: res.id.toString(),
                                            pixData: res.status === 'pending' ? {
                                                qrCode: res.point_of_interaction?.transaction_data?.qr_code,
                                                qrCodeBase64: res.point_of_interaction?.transaction_data?.qr_code_base64,
                                            } : undefined,
                                        });
                                    }
                                    if (res.status === 'approved') {
                                        onStatusChange({ status: StatusPayment.approved });
                                    }
                                })
                                .catch((err) => {
                                    console.error('Erro pagamento:', err);
                                    let errorMessage = 'Não conseguimos processar o seu pagamento.';
                                    const errorText = err?.message || err?.cause?.message || JSON.stringify(err);

                                    if (errorText?.includes('Invalid user identification number')) {
                                        errorMessage = 'CPF inválido. Por favor, verifique e tente novamente.';
                                    }

                                    onStatusChange({
                                        status: StatusPayment.rejected,
                                        errorMessage,
                                    });
                                })
                                .finally(() => {
                                    // 🚀 Desativa o loading após finalizar a requisição (caso não tenha mudado de página)
                                    setLoading(false);
                                });
                        },
                        onError: (err: any) => {
                            console.error('Erro no Brick:', err);
                            setLoading(false);
                        },
                    },
                }
            );
        } catch (err) {
            console.error('Erro na inicialização:', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!amount || amount <= 0) return;
        const timer = setTimeout(initPaymentBrick, 50);
        return () => clearTimeout(timer);
    }, [amount]);

    useEffect(() => {
        return () => {
            brickController.current?.unmount();
            brickController.current = null;
        };
    }, []);

    useEffect(() => {
        if (brickController.current) {
            brickController.current.update({
                initialization: { amount: Number(amount) },
            });
        }
    }, [amount]);

    return <div id="paymentCardBrick_container" />;
}