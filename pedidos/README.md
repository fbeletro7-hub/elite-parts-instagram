# App de pedidos da Elite Parts Distribuidora (WhatsApp)

Página única para técnicos: o cliente escolhe displays e tampas, informa nome e cidade e toca em "Enviar pedido no WhatsApp". O WhatsApp abre com a mensagem do pedido pronta para o número da loja.

## Como editar
Tudo fica no começo do `<script>` em `index.html`:
- `WHATSAPP`: número da loja só com dígitos (55 + DDD + número). Hoje: `5582998263519`.
- `TAMPAS`: modelo, tipo, preço e cores em estoque de cada tampa.
- `ATUALIZADO`: data da tabela.
- `PRODUTOS`: modelos, qualidade e preço.

## Como colocar no ar com domínio próprio (GitHub Pages, grátis)
1. Aprove (merge) o PR do app no GitHub.
2. No repositório: Settings > Pages > Source "Deploy from a branch" > Branch `main`, pasta `/ (root)` > Save.
   Em 1 a 2 minutos o app abre em `https://fbeletro7-hub.github.io/elite-parts-instagram/`.
3. Compre o domínio (ex.: no registro.br, cerca de R$ 40 por ano para `.com.br`).
4. No DNS do domínio (no registro.br: "Editar zona"), crie:
   - 4 registros **A** no domínio raiz apontando para `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - 1 registro **CNAME** `www` apontando para `fbeletro7-hub.github.io`
5. Volte em Settings > Pages > Custom domain, digite o domínio, salve e marque "Enforce HTTPS" quando liberar.

## Tampas
A lista `TAMPAS` tem só o que está em estoque, com as cores disponíveis. Preço = custo + 100%, arredondado pra cima.
