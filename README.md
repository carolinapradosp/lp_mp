# LP MP

Aplicação de e-commerce desenvolvida com **Next.js**, com catálogo de produtos, carrinho de compras, checkout integrado ao Mercado Pago e painel administrativo para gerenciamento da loja.

O projeto foi desenvolvido com foco em uma experiência de compra simples, gerenciamento de produtos e integração completa entre front-end, pagamentos e banco de dados.

## Funcionalidades

### Loja

- Listagem de produtos
- Carrinho de compras
- Preços progressivos de acordo com a quantidade
- Controle de estoque
- Checkout
- Pagamento
- Confirmação e acompanhamento do pagamento

### Painel Administrativo

- Autenticação administrativa
- Dashboard de pedidos
- Consulta de detalhes dos pedidos
- Cadastro e edição de produtos
- Upload de imagens
- Controle de estoque
- Ativação e desativação de produtos
- Regras de preços progressivos
- Exclusão de produtos

## Tecnologias

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Zustand**
- **PostgreSQL / Neon**
- **Mercado Pago**
- **Vercel Blob**
- **Jest**
- **Playwright**
- **GitHub Actions**
- **Vercel**

## Testes

O projeto possui testes automatizados utilizando:

- **Jest** para testes unitários e de regras de negócio
- **Playwright** para testes E2E dos principais fluxos da aplicação

Os testes e o build também são executados automaticamente através do **GitHub Actions** durante o processo de CI.

```bash
# Testes unitários
npm test

# Testes E2E
npm run test:e2e

# Coverage
npm run test:coverage

# Build
npm run build
```

## Variáveis de ambiente

As variáveis necessárias para executar o projeto estão documentadas no arquivo:

```text
.env.example
```

Crie um `.env.local` baseado nesse arquivo e configure as credenciais necessárias para o ambiente local.

## Executando o projeto

Instale as dependências:

```bash
npm install
```

Execute o ambiente de desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível em:

```text
http://localhost:3000
```

## Deploy

O projeto utiliza **Vercel** para deploy e **GitHub Actions** para integração contínua.

Branches de desenvolvimento são validadas através dos testes automatizados antes da integração com a branch principal.