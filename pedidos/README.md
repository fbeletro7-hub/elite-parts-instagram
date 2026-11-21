# App de pedidos da Elite Parts Distribuidora (WhatsApp)

Página única para técnicos: o cliente escolhe displays e tampas, informa nome e cidade e toca em "Enviar pedido no WhatsApp". O WhatsApp abre com a mensagem do pedido pronta para o número da loja.

## Como editar
Tudo fica no começo do `<script>` em `index.html`:
- `WHATSAPP`: número da loja só com dígitos (55 + DDD + número). Hoje: `5582998263519`.
- `TAMPAS`: modelos de tampa traseira. Preço `null` aparece como "A consultar"; troque pelo valor quando quiser mostrar o preço.
- `ATUALIZADO`: data da tabela.
- `PRODUTOS`: modelos, qualidade e preço.

## Como colocar no ar (grátis)
GitHub Pages: Settings > Pages > Branch `main`, pasta `/ (root)`. O link fica
`https://fbeletro7-hub.github.io/elite-parts-instagram/pedidos/` e pode ir na bio do Instagram.
