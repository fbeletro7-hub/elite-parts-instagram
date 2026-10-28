# Reels animados

Gerador do Reel "Display Elite" (18 s, 1080x1920).

    python3 gerador/voz.py pasta-modelos voz.wav "Frase 1." "Frase 2." ...   # Téo, Kokoro pm_alex
    python3 gerador/render.py video.mp4                                     # animação
    python3 gerador/musica.py                                               # trilha própria (sem direitos autorais)

Mixagem com ffmpeg (música abaixa sob a voz com sidechaincompress). Vídeos prontos ficam em `reels/` na pasta do projeto.

## Viral "Essa tela dobra" (16,6 s)

`viral/render.py` (precisa de `Michroma.ttf` na mesma pasta: `npm pack @fontsource/michroma` e converter o woff2 com fonttools) e `viral/musica.py` (batida + efeitos). Voz com `gerador/voz.py`.
Roteiro: tela Soft OLED dobrando, desafio "Incell ou OLED? comenta 1 ou 2", teste do preto, resposta, WhatsApp.
