//enum/StatusPayment.ts
enum StatusPayment {
  pending = 'pending',
  approved = 'approved',
  authorized = 'authorized', //significa que a administradora do cartão de crédito reservou o limite da compra, mas o valor ainda não foi efetivamente debitado ou repassado ao vendedor. É um estado intermediário de segurança.
  in_process = 'in_process',
  in_mediation = 'in_mediation', //significa que uma reclamação aberta entre comprador e vendedor não foi resolvida amigavelmente, e a plataforma precisou intervir. O dinheiro da transação fica retido até que a equipe do Mercado Pago analise o caso e tome uma decisão final
  rejected = 'rejected',
  cancelled = 'cancelled',
  refunded = 'refunded', //significa que a transação foi desfeita e o dinheiro devolvido ao comprador
  charged_back = 'charged_back', //Chargeback é a contestação de uma compra feita pelo cliente diretamente ao banco ou operadora do cartão. Quando isso acontece, o banco cancela a transação e o dinheiro é retirado da conta do vendedor.
}

export default StatusPayment;
