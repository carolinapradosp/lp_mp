// components/PaymentBrick.tsx

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { loadMercadoPago } from '@mercadopago/sdk-js';
import { apiFetch } from '@/services/api';
import StatusPayment from '@/enum/StatusPayment';

declare global {
    interface Window {
        MercadoPago: new (
            publicKey: string,
            options?: {
                locale?: string;
            }
        ) => {
            bricks: () => {
                create: (
                    type: string,
                    containerId: string,
                    settings: Record<string, unknown>
                ) => Promise<PaymentBrickController>;
            };
        };

        validateCheckoutForm?: () => boolean;
    }
}

type PaymentBrickController = {
    unmount: () => Promise<void> | void;
    update: (settings: Record<string, unknown>) => Promise<void> | void;
};

type CheckoutProduct = {
    id: string;
    quantity: number;
};

type CustomerData = {
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

type PaymentResponse = {
    id?: string | number;
    status?: StatusPayment;

    externalReference?: string;
    confirmationToken?: string;
    pixExpirationAt?: string | null;

    point_of_interaction?: {
        transaction_data?: {
            qr_code?: string;
            qr_code_base64?: string;
        };
    };

    message?: string;
};

type Props = {
    amount: number;
    products: CheckoutProduct[];
    customer: CustomerData;

    onStatusChange: (data: {
        status: StatusPayment;
        paymentId?: string;

        externalReference?: string;
        confirmationToken?: string;

        pixData?: {
            qrCode: string;
            qrCodeBase64?: string;
            expirationAt?: string | null;
        };

        errorMessage?: string;
    }) => void;

    setLoading: (loading: boolean) => void;
};

export default function PaymentBrick({
    amount,
    products,
    customer,
    onStatusChange,
    setLoading,
}: Props) {
    const mpInstance = useRef<InstanceType<typeof window.MercadoPago> | null>(
        null
    );

    const brickController = useRef<PaymentBrickController | null>(null);
    const initialized = useRef(false);

    const amountRef = useRef(amount);
    const customerRef = useRef(customer);
    const productsRef = useRef(products);

    useEffect(() => {
        amountRef.current = amount;
    }, [amount]);

    useEffect(() => {
        customerRef.current = customer;
    }, [customer]);

    useEffect(() => {
        productsRef.current = products;
    }, [products]);

    const initPaymentBrick = useCallback(async () => {
        if (initialized.current || brickController.current) {
            return;
        }

        const container = document.getElementById(
            'paymentCardBrick_container'
        );

        if (!container || container.childElementCount > 0) {
            return;
        }

        try {
            initialized.current = true;

            await loadMercadoPago();

            const publicKey =
                process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;

            if (!publicKey) {
                throw new Error(
                    'NEXT_PUBLIC_MP_PUBLIC_KEY não configurada.'
                );
            }

            if (!window.MercadoPago) {
                throw new Error(
                    'SDK do Mercado Pago não foi carregado.'
                );
            }

            if (!mpInstance.current) {
                mpInstance.current = new window.MercadoPago(
                    publicKey,
                    {
                        locale: 'pt-BR',
                    }
                );
            }

            const bricksBuilder =
                mpInstance.current.bricks();

            brickController.current =
                await bricksBuilder.create(
                    'payment',
                    'paymentCardBrick_container',
                    {
                        initialization: {
                            amount: Number(amountRef.current),
                            payer: {
                                email: customerRef.current.email,
                            },
                        },

                        customization: {
                            paymentMethods: {
                                bankTransfer: 'all',
                                creditCard: 'all',
                                maxInstallments: 12,
                            },

                            visual: {
                                style: {
                                    theme: 'light',
                                },
                                hideFormTitle: true,
                            },
                        },

                        callbacks: {
                            onReady: () => {
                                setLoading(false);
                            },

                            onSubmit: async ({
                                formData,
                            }: {
                                formData: Record<string, any>;
                            }) => {
                                setLoading(true);

                                const isValid =
                                    window.validateCheckoutForm?.() ??
                                    false;

                                if (!isValid) {
                                    setLoading(false);

                                    onStatusChange({
                                        status:
                                            StatusPayment.rejected,
                                        errorMessage:
                                            'Preencha os campos obrigatórios.',
                                    });

                                    return;
                                }

                                const currentCustomer =
                                    customerRef.current;

                                const payload = {
                                    items: productsRef.current.map(
                                        (product) => ({
                                            productId: product.id,
                                            quantity: product.quantity,
                                        })
                                    ),

                                    payment: {
                                        token: formData.token,
                                        paymentMethodId:
                                            formData.payment_method_id,
                                        issuerId:
                                            formData.issuer_id,
                                        installments:
                                            formData.installments,
                                    },

                                    customer: {
                                        firstName:
                                            currentCustomer.firstName,
                                        lastName:
                                            currentCustomer.lastName,
                                        email: currentCustomer.email,
                                        phone: currentCustomer.phone,

                                        identification: {
                                            type: 'CPF',
                                            number:
                                                currentCustomer.cpf.replace(
                                                    /\D/g,
                                                    ''
                                                ),
                                        },

                                        address: {
                                            zipCode:
                                                currentCustomer.address
                                                    .zipCode,
                                            federalUnit:
                                                currentCustomer.address
                                                    .federalUnit,
                                            city:
                                                currentCustomer.address.city,
                                            neighborhood:
                                                currentCustomer.address
                                                    .neighborhood,
                                            streetName:
                                                currentCustomer.address
                                                    .streetName,
                                            streetNumber:
                                                currentCustomer.address
                                                    .streetNumber,
                                            complement:
                                                currentCustomer.address
                                                    .complement,
                                        },
                                    },
                                };

                                try {
                                    const response =
                                        (await apiFetch(
                                            '/api/payments',
                                            {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type':
                                                        'application/json',
                                                },
                                                body: JSON.stringify(
                                                    payload
                                                ),
                                            }
                                        )) as PaymentResponse;

                                    if (!response.id) {
                                        throw new Error(
                                            response.message ||
                                            'Pagamento criado sem identificador.'
                                        );
                                    }
                                    const paymentId =
                                        String(response.id);

                                    if (!response.confirmationToken) {
                                        throw new Error(
                                            'Pagamento criado sem token de confirmação.'
                                        );
                                    }

                                    if (!response.externalReference) {
                                        throw new Error(
                                            'Pagamento criado sem referência externa.'
                                        );
                                    }

                                    const transactionData =
                                        response
                                            .point_of_interaction
                                            ?.transaction_data;

                                    const hasPixQrCode =
                                        Boolean(transactionData?.qr_code);

                                    onStatusChange({
                                        status:
                                            response.status ??
                                            StatusPayment.pending,

                                        paymentId,

                                        externalReference:
                                            response.externalReference,

                                        confirmationToken:
                                            response.confirmationToken,

                                        pixData: hasPixQrCode
                                            ? {
                                                qrCode:
                                                    transactionData!.qr_code!,

                                                qrCodeBase64:
                                                    transactionData?.qr_code_base64,

                                                expirationAt:
                                                    response.pixExpirationAt ??
                                                    null,
                                            }
                                            : undefined,
                                    });
                                } catch (error) {
                                    console.error(
                                        'Erro ao processar pagamento:',
                                        error
                                    );

                                    const errorText =
                                        error instanceof Error
                                            ? error.message
                                            : String(error);

                                    let errorMessage =
                                        'Não conseguimos processar o seu pagamento.';

                                    if (
                                        errorText.includes(
                                            'Invalid user identification number'
                                        )
                                    ) {
                                        errorMessage =
                                            'CPF inválido. Por favor, verifique e tente novamente.';
                                    }

                                    onStatusChange({
                                        status:
                                            StatusPayment.rejected,
                                        errorMessage,
                                    });
                                } finally {
                                    setLoading(false);
                                }
                            },

                            onError: (error: unknown) => {
                                console.error(
                                    'Erro no Brick:',
                                    error
                                );

                                setLoading(false);

                                onStatusChange({
                                    status:
                                        StatusPayment.rejected,
                                    errorMessage:
                                        'Não foi possível carregar ou processar o pagamento.',
                                });
                            },
                        },
                    }
                );
        } catch (error) {
            console.error(
                'Erro ao inicializar Mercado Pago:',
                error
            );

            initialized.current = false;
            setLoading(false);

            onStatusChange({
                status: StatusPayment.rejected,
                errorMessage:
                    'Não foi possível inicializar o pagamento.',
            });
        }
    }, [onStatusChange, setLoading]);

    useEffect(() => {
        if (!amount || amount <= 0) {
            return;
        }

        const timer = window.setTimeout(() => {
            void initPaymentBrick();
        }, 50);

        return () => {
            window.clearTimeout(timer);
        };
    }, [amount, initPaymentBrick]);

    useEffect(() => {
        if (!brickController.current) {
            return;
        }

        void brickController.current.update({
            initialization: {
                amount: Number(amount),
            },
        });
    }, [amount]);

    useEffect(() => {
        return () => {
            const controller =
                brickController.current;

            brickController.current = null;
            initialized.current = false;

            if (controller) {
                void controller.unmount();
            }
        };
    }, []);

    return (
        <div id="paymentCardBrick_container" />
    );
}