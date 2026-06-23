'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import PaymentBrick from '@/components/PaymentBrick';
import { useCartStore } from '@/store/cartStore';
import FormCheckout from '@/components/FormCheckout';
import LoadingOverlay from '@/components/LoadingOverlay';
import { Product } from '@/interfaces/Product';
import ResumoPagamento from '@/components/ResumoPagamento';
import ResumoPedido from '@/components/ResumoPedido';
import { useCheckoutStore } from '@/store/checkoutStore';
import StatusPayment from '@/enum/StatusPayment';

export default function Checkout() {
  const router = useRouter();
  const { products, hydrated, syncProducts } = useCartStore();
  const { setCheckoutData } = useCheckoutStore();

  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [paymentError, setPaymentError] = useState('');
  const [paymentBrickKey, setPaymentBrickKey] = useState(0);

  // frete fixo
  const shippingCost = 0;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    district: '',
    city: '',
    state: '',
  });

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoadingProducts(true);
        const response = await fetch('/api/products');
        const data = await response.json();

        const formattedProducts = data.map((product: Product) => ({
          ...product,
          base_price: Number(product.base_price),
        }));

        syncProducts(formattedProducts);
      } catch (error) {
        console.error('Erro ao sincronizar produtos:', error);
      } finally {
        setLoadingProducts(false);
        if (products.length === 0) {
          setLoading(false);
        }
      }
    }

    fetchProducts();
  }, [syncProducts]);

  const subtotal = useMemo(() => {
    return products.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [products]);

  const amount = useMemo(() => {
    if (products.length === 0) return 0;
    return subtotal + shippingCost;
  }, [subtotal, products.length]);

  const isGlobalLoading = !hydrated || loading || loadingProducts;

  return (
    <>
      {isGlobalLoading && (
        <LoadingOverlay
          visible={isGlobalLoading}
          message="Carregando..."
        />
      )}

      <main className="min-h-screen bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-480 flex-col gap-10 lg:flex-row items-start">

          {/* COLUNA ESQUERDA - DADOS DE ENTREGA E PEDIDO */}
          <section className="w-full border border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] p-6 lg:w-[58%] sm:p-10">

            {/* HEADER */}
            <div className="mb-8 border-b border-[var(--color-brand-border)] pb-8">
              <span className="mb-4 inline-flex text-[10px] font-semibold uppercase tracking-widest text-[var(--color-brand-accent)] border border-[var(--color-brand-border)] bg-white px-3 py-1">
                Checkout Seguro
              </span>

              <h1 className="text-3xl font-light tracking-tight text-[var(--color-brand-dark)] sm:text-4xl">
                Dados para <span className="font-medium">entrega</span>
              </h1>

              <p className="mt-3 text-xs leading-relaxed text-[var(--color-brand-muted)] max-w-md">
                Preencha suas informações para concluir o pedido com segurança e rapidez.
              </p>
            </div>

            {/* RESUMO PEDIDO */}
            <div className="mb-8">
              <ResumoPedido />
            </div>

            {/* FORMULARIO */}
            <div className="border border-[var(--color-brand-border)] bg-white p-5 sm:p-8">
              <FormCheckout
                formData={formData}
                setFormData={setFormData}
                paymentError={paymentError}
                setPaymentError={setPaymentError}
              />
            </div>
          </section>

          {/* COLUNA DIREITA - ASIDE DE PAGAMENTO */}
          <aside className="w-full lg:w-[42%] lg:sticky lg:top-8">
            <div className="border border-[var(--color-brand-border)] bg-white p-6 sm:p-10">

              {/* HEADER ASIDE */}
              <div className="mb-6 border-b border-[var(--color-brand-border)] pb-6">
                <h2 className="text-2xl font-medium tracking-tight text-[var(--color-brand-dark)]">
                  Pagamento
                </h2>
                <p className="mt-1 text-xs text-[var(--color-brand-muted)]">
                  Ambiente seguro e criptografado.
                </p>
              </div>

              {/* RESUMO FINANCEIRO */}
              <div className="mb-6">
                <ResumoPagamento
                  products={products}
                  shippingCost={shippingCost}
                  amount={amount}
                />
              </div>

              {/* GATEWAY INTEGRATION CONTAINER */}
              <div className="border border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] p-2 sm:p-4">
                {amount > 0 && (
                  <PaymentBrick
                    key={paymentBrickKey}
                    amount={amount}
                    products={products}
                    shippingCost={shippingCost}
                    user={{
                      orderId: crypto.randomUUID(),
                      firstName: formData.name.split(' ')[0] || '',
                      lastName: formData.name.split(' ').slice(1).join(' ') || '',
                      email: formData.email,
                      cpf: formData.cpf,
                      phone: formData.phone,
                      address: {
                        zipCode: formData.cep,
                        federalUnit: formData.state,
                        city: formData.city,
                        neighborhood: formData.district,
                        streetName: formData.address,
                        streetNumber: formData.number,
                        complement: formData.complement,
                      },
                    }}
                    setLoading={setLoading}
                    onStatusChange={({
                      status,
                      paymentId,
                      pixData,
                      errorMessage,
                    }) => {
                      setPaymentError('');

                      if (errorMessage) {
                        setPaymentError(errorMessage);
                        setPaymentBrickKey((prev) => prev + 1);
                        return;
                      }

                      if (!paymentId) return;

                      setCheckoutData({
                        paymentId,
                        amount,
                        status: status as StatusPayment,
                        pixData: pixData?.qrCode && pixData?.qrCodeBase64
                          ? {
                            qrCode: pixData.qrCode,
                            qrCodeBase64: pixData.qrCodeBase64,
                          }
                          : undefined,
                      });

                      router.push(`/order-confirmation?paymentId=${paymentId}`);
                    }}
                  />
                )}
              </div>

              {/* BOTAO AUXILIAR DE RETORNO */}
              <button
                onClick={() => router.push('/')}
                className="mt-6 flex h-12 w-full items-center justify-center border border-[var(--color-brand-border)] bg-transparent text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-muted)] transition-all duration-200 hover:border-[var(--color-brand-dark)] hover:text-[var(--color-brand-dark)] cursor-pointer"
              >
                Voltar e alterar carrinho
              </button>

            </div>
          </aside>

        </div>
      </main>
    </>
  );
}