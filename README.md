# FastDish

FastDish e uma aplicacao web em React + Vite para pedidos de lanchonete. O fluxo cobre cardapio por categorias, carrinho, endereco com consulta de CEP, forma de pagamento e envio do pedido pelo WhatsApp.

<p align="center">
  <img src="public/cover.png" alt="Mockup do FastDish" width="700"/>
</p>

## Demo

https://fastdish.vercel.app/

## Funcionalidades

- Cardapio por categorias: pizzas, hamburgueres e bebidas.
- Carrinho com adicionar, remover, limpar, quantidade e total em tempo real.
- Taxa de entrega e pedido minimo configuraveis por variaveis de ambiente.
- Endereco com preenchimento por ViaCEP e validacao de campos obrigatorios.
- Observacoes do pedido antes do pagamento.
- Pagamento por dinheiro, cartao e Pix.
- Pix copia-e-cola com QR Code gerado no front-end.
- Mensagem de pedido pronta para WhatsApp.
- Layout responsivo com menu mobile e modais acessiveis.
- Testes unitarios e de fluxo para carrinho, checkout, Pix, cartao e ViaCEP.

## Tecnologias

- React 18
- Vite
- JavaScript
- CSS
- Vitest + Testing Library
- Playwright + axe-core
- qrcode
- sharp

## Integracoes

- ViaCEP: busca de endereco pelo CEP.
- WhatsApp: envio do pedido para o numero configurado.
- Pix EMV: payload copia-e-cola e QR Code.

## Estrutura

```text
src/
  App.jsx                    Orquestra fluxo, modais e checkout
  main.jsx                   Entrada React
  assets/                    PNGs originais e WebPs otimizados
  components/                Header, Menu, DishCard, Address/Cart/Payment modals
  config/store.js            Configuracao da loja via Vite env
  data/dishes.js             Dados e imagens do cardapio
  hooks/useCart.js           Regras do carrinho
  styles/                    CSS por area da interface
  utils/cardValidation.js    Validacao e mascara de cartao
  utils/pix.js               Geracao de payload Pix
  utils/viacep.js            Cliente ViaCEP

scripts/
  optimize-assets.mjs        Gera WebP a partir dos PNGs de produto

test/
  setupTests.js              Setup global dos testes
```

## Ambiente

Copie `.env.example` para `.env.local` e ajuste os valores da loja.

```bash
cp .env.example .env.local
```

Variaveis principais:

```bash
VITE_STORE_NAME=FastDish
VITE_STORE_PHONE_DISPLAY=(85) 99906-2339
VITE_WHATSAPP_PHONE=5585999062339
VITE_STORE_STREET=Rua Exemplo
VITE_STORE_NUMBER=123
VITE_STORE_CITY=Fortaleza
VITE_STORE_STATE=CE
VITE_PIX_KEY=85999062338
VITE_PIX_MERCHANT_NAME=FASTDISH
VITE_PIX_MERCHANT_CITY=FORTALEZA
VITE_DELIVERY_FEE=0
VITE_MINIMUM_ORDER=0
```

Use `VITE_DELIVERY_FEE` para cobrar entrega e `VITE_MINIMUM_ORDER` para bloquear pedidos abaixo do valor minimo.

## Como Executar

```bash
npm install
npm run dev
```

O Vite normalmente abre em `http://localhost:5173`.

## Scripts

```bash
npm run dev              # servidor local
npm run check:a11y       # axe + screenshots via Playwright
npm run build            # build de producao
npm run preview          # preview da build
npm run test             # testes automatizados
npm run optimize:assets  # gera WebPs otimizados em src/assets
```

Quando alterar PNGs de produto em `src/assets`, rode `npm run optimize:assets` e mantenha os PNGs como fonte editavel. A aplicacao importa os WebPs.

Para a checagem Playwright/Axe, mantenha o servidor local ativo em `http://127.0.0.1:5173` ou informe outro endereco:

```bash
CHECK_URL=http://127.0.0.1:4173 npm run check:a11y
```

## Testes

A suite cobre:

- `useCart`: adicionar, remover, incrementar e limpar itens.
- `viacep`: sucesso, CEP invalido e falha de rede/API.
- `cardValidation`: bandeira, mascara, Luhn, validade e CVV.
- `pix`: CRC16 e payload EMV.
- `DishCard`, `Header`, `CartModal` e `PaymentModal`.
- Fluxo principal em `App.test.jsx`: carrinho, endereco obrigatorio e finalizacao no WhatsApp.

Execute antes de publicar:

```bash
npm run test
npm run build
npm run check:a11y
npm audit
```

## Observacoes Operacionais

- Os dados do cardapio ficam em `src/data/dishes.js`; para adicionar produto, importe a imagem WebP e inclua o item na categoria correta.
- As informacoes da loja ficam em `src/config/store.js` e devem vir preferencialmente de `.env.local`.
- O app ainda e front-end only; pedidos sao enviados pelo WhatsApp e nao ha persistencia em banco.
- Cartao e Pix sao simulados no front-end. Para producao real, integre um provedor de pagamento e remova qualquer coleta local de dados sensiveis.
