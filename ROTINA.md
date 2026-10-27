# Rotina diária do Instagram @elitepartsofc

Todo dia: **1 post no feed + 5 stories**, publicados automaticamente pelo Metricool (marca blogId `7693398`, fuso `America/Sao_Paulo`).

## Passo a passo
1. Leia `temas.md` e escolha um tema novo (não repetir os últimos 10 dias). Alterne entre: produto (displays, tampas, componentes), educação técnica, bastidores/confiança, chamada para o WhatsApp.
2. Crie a pasta `AAAA-MM-DD/` com `conteudo.json` (mesmo formato de `2026-10-27/conteudo.json`: `feed` + 5 `stories`) e `legenda.txt`.
3. Gere as artes: `node gerador/gerar.js AAAA-MM-DD/conteudo.json AAAA-MM-DD/` (Playwright já vem instalado). Converta cada PNG para JPEG qualidade 92 e apague os PNG.
4. Olhe as imagens antes de publicar: texto não pode cortar nem ficar em cima do celular. Título de story com no máximo ~17 caracteres por linha.
5. `git add`, commit e `git push` para `main`. Pegue o SHA do commit e use links fixos: `https://raw.githubusercontent.com/fbeletro7-hub/elite-parts-instagram/<SHA>/AAAA-MM-DD/<arquivo>.jpg`.
6. Agende no Metricool (`createScheduledPost`, `autoPublish: true`):
   - Story 1: 09:10 — saudação/abertura do dia
   - Story 2: 11:40
   - Feed (`type: POST`, com a legenda): 12:10
   - Story 3: 12:20 — "post novo no feed"
   - Story 4: 16:40
   - Story 5: 19:40 — chamada para o WhatsApp
   Stories vão sem texto (`instagramData.type: STORY`).
7. Adicione a linha do dia em `temas.md` e faça push.

## Foco: ganhar seguidores em Alagoas
O objetivo principal é crescer seguidores no estado de Alagoas (técnicos, assistências e lojistas de celular).
- Toda legenda cita Alagoas ou Maceió de forma natural (ex.: "Técnico de Maceió e de todo o interior de Alagoas...").
- Hashtags: sempre incluir 4–6 locais, variando entre #alagoas #maceio #maceioal #arapiraca #assistenciatecnicamaceio #celularmaceio #iphonemaceio #tecnicoalagoas #palmeiradosindios #riolargo #penedo, junto com as de produto.
- Pelo menos 2 vezes por semana, um post ou story fala diretamente com o técnico alagoano (ex.: "Assistência em Maceió? Marca a gente", "De qual cidade de Alagoas você é? Responda no direct").
- Uma vez por semana, story pedindo para marcar um amigo técnico de Alagoas e compartilhar o post.
- Nunca inventar endereço, loja física, entrega local ou prazo em Alagoas: só citar o que o dono confirmar.

## Regras da marca
- Fundo escuro #0A0D14, azul #3D7BFF, texto #F2F5FA, cinza #7F8BA3, fonte Michroma (o gerador já aplica).
- Português do Brasil, tom direto, de técnico para técnico. Legenda: gancho, 2–4 linhas de valor, chamada para WhatsApp ("link da bio"), 8–15 hashtags.
- Nunca inventar preço, prazo, garantia, estoque ou "pronta entrega". Dizer "para iPhone", nunca usar marca da Apple.
- Não repetir frases e artes iguais em dias seguidos.
