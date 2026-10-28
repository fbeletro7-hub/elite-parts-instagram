# Comercial "Qualidade do display"

Vídeo vertical (1080x1920, 40s, com narração) com um técnico trocando a tela: abre o iPhone, tira a tela trincada,
instala o Display Elite, liga e compara com uma tela comum.

    python3 trilha.py trilha.wav
    python3 narracao.py pasta-modelos-kokoro voz.wav
    node renderizar.js comercial.mp4 trilha.wav voz.wav

A voz segue o padrão de `../VOZ-PADRAO.md`.

Textos e tempos das cenas ficam em `cena.html` (lista `CAPS` e função `render`).
