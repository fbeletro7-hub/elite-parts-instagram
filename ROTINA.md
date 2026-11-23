# Rotina diária do Instagram @elitepartsofc

Todo dia: **1 Reel + 1 post no feed + 5 stories**, publicados automaticamente pelo Metricool (marca blogId `7693398`, fuso `America/Sao_Paulo`).

> **Pedido do dono (23/11): Reel TODO DIA e visual variado.** Mesmo quando a tarefa do dia falar só em "feed + 5 stories", gere também o Reel (passo 4), copie `reel.mp4`, `reel-capa.jpg` e `legenda-reel.txt` junto com os outros arquivos para `/mnt/project-files/instagram/AAAA-MM-DD/` (11 arquivos no total), anexe o `reel.mp4` na resposta e inclua no resumo a legenda do Reel e o horário sugerido do Reel (18:30). Siga a seção "Variar o visual".

## Passo a passo
1. Leia `temas.md` e escolha um tema novo (não repetir os últimos 10 dias). Alterne entre: produto (displays, tampas, componentes), educação técnica, bastidores/confiança, chamada para o WhatsApp.
2. Crie a pasta `AAAA-MM-DD/` com `conteudo.json` (modelo completo: `2026-11-23/conteudo.json`, com `estilo`, `feed`, 5 `stories` e `reel`), `legenda.txt` (feed) e `legenda-reel.txt` (Reel).
3. Gere as artes: `node gerador/gerar.js AAAA-MM-DD/conteudo.json AAAA-MM-DD/` (Playwright já vem instalado). Converta cada PNG para JPEG qualidade 92 e apague os PNG.
4. Gere o Reel: `node gerador/reel.js AAAA-MM-DD/conteudo.json AAAA-MM-DD/` (sai `reel.mp4` e `reel-capa.jpg`, ~1 min).
5. Olhe as imagens antes de publicar: texto não pode cortar nem ficar em cima do celular. Título de story com no máximo ~17 caracteres por linha. No Reel, extraia alguns quadros com ffmpeg e confira.
6. `git add`, commit e `git push` para `main`. Pegue o SHA do commit e use links fixos: `https://raw.githubusercontent.com/fbeletro7-hub/elite-parts-instagram/<SHA>/AAAA-MM-DD/<arquivo>.jpg`.
7. Agende no Metricool (só quando a postagem automática estiver ativa; o Reel vai às 18:30, `type: REEL`) (`createScheduledPost`, `autoPublish: true`):
   - Story 1: 09:10 — saudação/abertura do dia
   - Story 2: 11:40
   - Feed (`type: POST`, com a legenda): 12:10
   - Story 3: 12:20 — "post novo no feed"
   - Story 4: 16:40
   - Story 5: 19:40 — chamada para o WhatsApp
   Stories vão sem texto (`instagramData.type: STORY`).
8. Adicione a linha do dia em `temas.md` (com o estilo usado) e faça push.

## Variar o visual (não deixar repetitivo)
- `estilo` do dia: `escuro`, `claro` ou `azul`. Nunca repetir o estilo do feed de ontem (veja a coluna de estilo em `temas.md`). Cada story pode ter seu próprio `estilo` para misturar.
- `ilustracao` do feed: alterne entre `lista` (01/02/03 tipográfico), `numero`, `pergunta`, `pecas`, `tampas`, `um`, `tres`. Não usar a mesma do feed de ontem.
- Nos stories, use pelo menos 3 ilustrações diferentes no dia (ex.: `pergunta` na enquete, `lista` no "post novo", `nenhuma` + `destaque` no story de Alagoas).

## Reel diário
- 3 a 5 cenas + final automático com o Téo e o botão do WhatsApp. Duração fica entre 18 e 30 s.
- Cena 1 é o gancho: pergunta ou problema forte, aparece já no primeiro quadro (vira a capa).
- `visual` das cenas: `celular`, `rachada`, `erro`, `check`, `tampas`, `pecas`, `lista` (com `itens`), `pergunta`, `numero`, `logo`. Não repetir o mesmo visual em duas cenas.
- `musica`: alternar `a` e `b` a cada dia. `estilo` do Reel pode ser diferente do feed.
- Legenda do Reel termina com uma pergunta para puxar comentário. Horário sugerido do Reel: 18:30.

## Foco: ganhar seguidores em Alagoas
O objetivo principal é crescer seguidores no estado de Alagoas (técnicos, assistências e lojistas de celular).
- Toda legenda cita Alagoas ou Maceió de forma natural (ex.: "Técnico de Maceió e de todo o interior de Alagoas...").
- Hashtags: sempre incluir 4–6 locais, variando entre #alagoas #maceio #maceioal #arapiraca #assistenciatecnicamaceio #celularmaceio #iphonemaceio #tecnicoalagoas #palmeiradosindios #riolargo #penedo, junto com as de produto.
- Pelo menos 2 vezes por semana, um post ou story fala diretamente com o técnico alagoano (ex.: "Assistência em Maceió? Marca a gente", "De qual cidade de Alagoas você é? Responda no direct").
- Uma vez por semana, story pedindo para marcar um amigo técnico de Alagoas e compartilhar o post.
- A Elite Parts NÃO tem loja física. Atendimento é pelo WhatsApp (link da bio). Nunca citar endereço, loja ou "venha nos visitar". Entrega e prazo em Alagoas só se o dono confirmar.

## Regras da marca
- Fundo escuro #0A0D14, azul #3D7BFF, texto #F2F5FA, cinza #7F8BA3, fonte Michroma (o gerador já aplica).
- Português do Brasil, tom direto, de técnico para técnico. Legenda: gancho, 2–4 linhas de valor, chamada para WhatsApp ("link da bio"), 8–15 hashtags.
- Nunca inventar preço, prazo, garantia, estoque ou "pronta entrega". Dizer "para iPhone", nunca usar marca da Apple.
- Não repetir frases e artes iguais em dias seguidos.
