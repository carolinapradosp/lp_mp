//components/MessagePayment/index.tsx

import StatusPayment from '@/enum/StatusPayment';
import { formatCurrency } from '@/utils/utils';
import { Button } from '@headlessui/react';
import Image from 'next/image';
import { Check, Clock, AlertTriangle } from 'lucide-react';

interface PaymentTypeProps {
  type: StatusPayment;
  orderId: string;
  amount: number;
  pixData?: {
    qrCode: string;
    qrCodeBase64?: string;
    expirationAt?: string | null;
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
      await navigator.clipboard.writeText(pixData.qrCode);
      onCopyPix();
    } catch (err) {
      console.error('Falha ao copiar código:', err);
    }
  };

  // Botão minimalista institucional
  const primaryButtonStyle = `
    w-full cursor-pointer bg-[var(--color-brand-dark)]
    px-6 py-4 text-xs font-semibold uppercase
    tracking-widest text-white transition-colors duration-200
    hover:bg-neutral-800 text-center block
  `;

  // PIX PENDENTE
  if (type === 'pending') {
    return (
      <div className="text-center">

        {/* ÍCONE MINIMALISTA */}
        <div className="mx-auto mb-5 flex justify-center text-[var(--color-brand-dark)]">
          <Clock className="h-8 w-8" />
        </div>

        {/* TÍTULO */}
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-brand-dark)]">
          Aguardando Pagamento
        </h2>

        {/* NUMERAÇÃO DO PEDIDO */}
        {orderId && (
          <p className="mt-1 text-xs tracking-wider text-[var(--color-brand-muted)] uppercase">
            ID do Pedido: #{orderId}
          </p>
        )}

        {/* TEXTO INFORMATIVO */}
        <p className="mx-auto mt-4 max-w-sm text-sm text-[var(--color-brand-muted)]">
          Escaneie o código QR através do aplicativo do seu banco ou utilize a opção Copia e Cola para finalizar o pagamento de:
        </p>

        <strong className="mt-3 block text-2xl font-bold tracking-tight text-[var(--color-brand-dark)]">
          {formatCurrency(amount)}
        </strong>

        {/* QR CODE COM BORDA FINA */}
        <div className="mt-8 flex justify-center">
          <div className="border border-[var(--color-brand-border)] bg-white p-4">
            {pixData?.qrCodeBase64 ? (
              <Image
                src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                alt="QR Code Pix"
                width={200}
                height={200}
                className="block"
              />
            ) : (
              <div className="h-[200px] w-[200px] bg-neutral-50 flex items-center justify-center text-xs text-[var(--color-brand-muted)]">
                QR Code indisponível.
              </div>
            )}
          </div>
        </div>

        {/* ÁREA DE TEXTO COPIA E COLA */}
        <div className="mt-8">
          <div className="border border-[var(--color-brand-border)] bg-neutral-50 p-4 text-left">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand-muted)]">
              Código Pix Copia e Cola
            </p>
            <div className="break-all font-mono text-[11px] text-[var(--color-brand-dark)] select-all max-h-16 overflow-y-auto subtle-scrollbar">
              {pixData?.qrCode}
            </div>
          </div>

          <Button
            onClick={handleCopyClick}
            className={`${primaryButtonStyle} mt-4 ${copied ? 'bg-neutral-900 border border-neutral-900' : ''
              }`}
          >
            {copied ? '✓ Código Copiado' : 'Copiar Código Pix'}
          </Button>

          <p className="mt-4 text-xs font-medium text-[var(--color-brand-muted)]">
            Este código expira em 30 minutos.
          </p>
        </div>

      </div>
    );
  }

  // CONFIGURAÇÃO DOS DEMAIS STATUS
  const statusConfig = {
    approved: {
      title: 'Pagamento Confirmado',
      desc: `Seu pagamento de ${formatCurrency(amount)} foi processado com sucesso. O pedido já foi encaminhado para a separação e logística.`,
      icon: <Check className="h-8 w-8 text-[var(--color-brand-dark)]" />,
      btnLabel: 'Retornar à Loja',
      link: '/',
    },
    rejected: {
      title: 'Pagamento não Autorizado',
      desc: errorMessage || `A transação de ${formatCurrency(amount)} foi recusada pela instituição financeira. Certifique-se dos dados ou tente outra forma de pagamento.`,
      icon: <AlertTriangle className="h-8 w-8 text-[var(--color-brand-dark)]" />,
      btnLabel: 'Refazer Checkout',
      link: '/checkout',
    },
    in_process: {
      title: 'Pagamento em Análise',
      desc: `A confirmação do valor de ${formatCurrency(amount)} está sendo avaliada pelo gateway de segurança. A atualização ocorre de forma automática.`,
      icon: <Clock className="h-8 w-8 text-[var(--color-brand-dark)]" />,
      btnLabel: 'Voltar ao Início',
      link: '/',
    },
  };

  const config = statusConfig[type as keyof typeof statusConfig];

  if (config) {
    return (
      <div className="text-center">

        {/* ÍCONE */}
        <div className="mx-auto mb-5 flex justify-center">
          {config.icon}
        </div>

        {/* TÍTULO */}
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-brand-dark)]">
          {config.title}
        </h2>

        {/* NUMERAÇÃO DO PEDIDO */}
        {orderId && (
          <p className="mt-1 text-xs tracking-wider text-[var(--color-brand-muted)] uppercase">
            ID do Pedido: #{orderId}
          </p>
        )}

        {/* DESCRIÇÃO */}
        <p className="mx-auto mt-4 max-w-sm text-sm text-[var(--color-brand-muted)] leading-relaxed">
          {config.desc}
        </p>

        {/* AÇÃO PRINCIPAL */}
        <Button
          onClick={() => (window.location.href = config.link)}
          className={`${primaryButtonStyle} mt-8`}
        >
          {config.btnLabel}
        </Button>

      </div>
    );
  }

  return null;
}