//components/MessagePayment/index.tsx

import StatusPayment from '@/enum/StatusPayment';
import { formatCurrency } from '@/utils/utils';
import { Button } from '@headlessui/react';
import Image from 'next/image';

import {
  FaCheck,
  FaClock
} from 'react-icons/fa';

import { MdError } from 'react-icons/md';

interface PaymentTypeProps {
  type: StatusPayment;
  orderId: any;
  amount: number;
  pixData?: {
    qrCode: string;
    qrCodeBase64: string
  } | null;
  copied: boolean;
  errorMessage?: string;
  onCopyPix: () => void;
}

export default function MessagePayment({
  type,
  amount,
  pixData,
  copied,
  onCopyPix,
  orderId,
  errorMessage
}: PaymentTypeProps) {

  const handleCopyClick = async () => {

    if (!pixData?.qrCode) return;

    try {
      await navigator.clipboard.writeText(
        pixData.qrCode
      );

      onCopyPix();

    } catch (err) {
      console.error(
        'Falha ao copiar código:',
        err
      );
    }
  };

  const primaryButtonStyle = `
    w-full cursor-pointer rounded-2xl
    bg-linear-to-r from-blue-600 to-indigo-600
    px-5 py-4 text-sm font-black uppercase
    tracking-wide text-white
    transition-all duration-300
    hover:scale-[1.01]
    hover:shadow-[0_12px_30px_rgba(37,99,235,0.30)]
  `;

  // PIX
  if (type === 'pending') {

    return (
      <div className='text-center'>

        {/* ÍCONE */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-amber-200 bg-amber-50">

          <FaClock className="h-10 w-10 animate-pulse text-amber-500" />

        </div>

        {/* TÍTULO */}
        <h2 className="text-4xl font-black tracking-tight text-neutral-900">
          Pagamento pendente
        </h2>

        {/* PEDIDO */}
        {orderId && (
          <h3 className="mt-3 text-sm font-medium text-neutral-500">
            Pedido #{orderId}
          </h3>
        )}

        {/* TEXTO */}
        <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-neutral-600">
          Escaneie o QR Code abaixo ou copie o código PIX
          para concluir o pagamento de:
        </p>

        <strong className="mt-4 block text-5xl font-black tracking-tight text-blue-600">
          {formatCurrency(amount)}
        </strong>

        {/* QR CODE */}
        <div className="mt-10 flex justify-center">

          <div className="rounded-4xl border border-neutral-200 bg-white p-5 shadow-sm">

            <Image
              src={`data:image/png;base64,${pixData?.qrCodeBase64}`}
              alt="QR Code Pix"
              width={240}
              height={240}
              className="rounded-2xl"
            />

          </div>

        </div>

        {/* COPY */}
        <div className="mt-8">

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-left">

            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-500">
              Código PIX
            </p>

            <div className="break-all font-mono text-xs text-neutral-700">
              {pixData?.qrCode}
            </div>

          </div>

          <Button
            onClick={handleCopyClick}
            className={`${primaryButtonStyle} mt-5 ${copied
              ? 'from-emerald-500 to-emerald-600'
              : ''
              }`}
          >
            {copied
              ? '✓ Código Pix Copiado!'
              : 'Copiar Código Pix'}
          </Button>

          <p className="mt-5 text-sm font-medium text-amber-600">
            O QR Code expira em 30 minutos
          </p>

        </div>

      </div>
    );
  }

  // STATUS
  const statusConfig = {
    approved: {
      title: 'Pagamento aprovado!',
      desc: `Seu pagamento de ${formatCurrency(amount)} foi confirmado com sucesso. Seu pedido já está sendo preparado.`,
      icon: (
        <FaCheck className="h-10 w-10 text-emerald-600" />
      ),
      iconBg:
        'border-emerald-200 bg-emerald-50',
      btnLabel: 'Voltar ao início',
      link: '/',
    },

    rejected: {
      title: 'Pagamento recusado',
      desc:
        errorMessage ||
        `Não conseguimos aprovar o seu pagamento de ${formatCurrency(amount)}. Você pode tentar novamente.`,
      icon: (
        <MdError className="h-10 w-10 text-red-500" />
      ),
      iconBg:
        'border-red-200 bg-red-50',
      btnLabel: 'Tentar novamente',
      link: '/checkout',
    },

    in_process: {
      title: 'Pagamento em análise',
      desc:
        `Estamos aguardando a confirmação do pagamento de ${formatCurrency(amount)}. Isso pode levar alguns instantes.`,
      icon: (
        <FaClock className="h-10 w-10 text-amber-500" />
      ),
      iconBg:
        'border-amber-200 bg-amber-50',
      btnLabel: 'Voltar ao início',
      link: '/',
    },
  };

  const config =
    statusConfig[
    type as keyof typeof statusConfig
    ];

  if (config) {

    return (
      <div className="text-center">

        {/* ÍCONE */}
        <div className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border ${config.iconBg}`}>
          {config.icon}
        </div>

        {/* TÍTULO */}
        <h2 className="text-4xl font-black tracking-tight text-neutral-900">
          {config.title}
        </h2>

        {/* PEDIDO */}
        {orderId && (
          <h3 className="mt-3 text-sm font-medium text-neutral-500">
            Pedido #{orderId}
          </h3>
        )}

        {/* TEXTO */}
        <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-neutral-600">
          {config.desc}
        </p>

        {/* BOTÃO */}
        <Button
          onClick={() => (
            window.location.href =
            config.link
          )}
          className={`${primaryButtonStyle} mt-10`}
        >
          {config.btnLabel}
        </Button>

      </div>
    );
  }

  return null;
}