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
  const shippingCost = 150;

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
    return products.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  }, [products]);

  const amount = useMemo(() => {
    if (products.length === 0) return 0;

    return subtotal + shippingCost;

  }, [subtotal, products.length]);

  const isGlobalLoading =
    !hydrated ||
    loading ||
    loadingProducts;

  return (
    <>
      {isGlobalLoading && (
        <LoadingOverlay
          visible={isGlobalLoading}
          message="Carregando..."
        />
      )}

      <main className="min-h-screen bg-linear-to-b from-[#f8fbff] to-white px-4 py-10">
        <div className="mx-auto flex w-full max-w-480 flex-col gap-8 lg:flex-row">

          {/* CONTEÚDO */}
          <section className="w-full rounded-4xl border border-neutral-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] lg:w-[55%] sm:p-8">

            {/* HEADER */}
            <div className="mb-8 border-b border-neutral-100 pb-8">

              <span className="mb-4 inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                Checkout Seguro
              </span>

              <h1 className="text-4xl font-black tracking-tight text-neutral-900">
                Dados para entrega
              </h1>

              <p className="mt-3 max-w-xl text-neutral-500">
                Preencha suas informações para concluir o pedido com segurança e rapidez.
              </p>
            </div>

            {/* RESUMO PEDIDO */}
            <ResumoPedido />

            {/* FORM */}
            <div className="rounded-[28px] border border-neutral-200 bg-linear-to-b from-white to-blue-50/30 p-5 sm:p-6">
              <FormCheckout
                formData={formData}
                setFormData={setFormData}
                paymentError={paymentError}
                setPaymentError={setPaymentError}
              />
            </div>

          </section>

          {/* ASIDE */}
          <aside className="w-full lg:w-[45%]">
            <div className="sticky top-6 rounded-4xl border border-neutral-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8">

              {/* HEADER */}
              <div className="mb-8 border-b border-neutral-100 pb-6">

                <h2 className="text-3xl font-black tracking-tight text-neutral-900">
                  Pagamento
                </h2>

                <p className="mt-2 text-neutral-500">
                  Ambiente seguro e criptografado.
                </p>

              </div>

              {/* RESUMO PAGAMENTO */}
              <ResumoPagamento
                products={products}
                shippingCost={shippingCost}
                amount={amount}
              />

              {/* PAGAMENTO */}
              <div className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white p-2 sm:p-4">

                {amount > 0 && (
                  <PaymentBrick
                    key={paymentBrickKey}
                    amount={amount}
                    products={products}
                    shippingCost={shippingCost}
                    user={{
                      orderId: crypto.randomUUID(),

                      firstName:
                        formData.name.split(' ')[0] || '',

                      lastName:
                        formData.name
                          .split(' ')
                          .slice(1)
                          .join(' ') || '',

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

                        pixData:
                          pixData?.qrCode &&
                            pixData?.qrCodeBase64
                            ? {
                              qrCode: pixData.qrCode,
                              qrCodeBase64:
                                pixData.qrCodeBase64,
                            }
                            : undefined,
                      });

                      router.push(
                        `/order-confirmation?paymentId=${paymentId}`
                      );
                    }}
                  />
                )}

              </div>

              {/* VOLTAR */}
              <button
                onClick={() => router.push('/')}
                className="mt-8 flex h-14 w-full items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 px-5 text-sm font-black uppercase tracking-wide text-neutral-700 transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
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