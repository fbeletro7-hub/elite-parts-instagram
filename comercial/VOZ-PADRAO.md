# Voz padrão dos vídeos Elite Parts

Toda narração usa o personagem **Téo** (técnico da Elite Parts) com esta voz, sempre com os mesmos ajustes.
A Piper/Faber foi testada e descartada (soou robótica).

| Item | Valor |
|---|---|
| Ferramenta | Kokoro v1.0 via `pip install kokoro-onnx soundfile`, roda offline, sem conta |
| Voz | `pm_alex` (masculina, português do Brasil), `lang='pt-br'` |
| Velocidade | `speed=1.05` |
| Pausa entre frases | 0.35 s |
| Modelos | https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx e `voices-v1.0.bin` (mesmo endereço) |
| Personagem | `comercial/personagem/personagem.js` (Téo), vídeo falando com `video.js` |

Alternativas testadas: `pm_santa` (masculina grave) e `pf_dora` (feminina).

## Como gerar

    python3 comercial/personagem/fala.py pasta-modelos pm_alex fala.wav fala.json "Frase 1." "Frase 2."
    node comercial/personagem/video.js fala.wav fala.json teo.mp4

Para narração em tempos certos de um comercial, ver `comercial/display/narracao.py`.

## Pronúncia (escrever assim no texto da fala)

| Palavra | Escrever |
|---|---|
| Elite Parts | Elíti Párts |
| Display | Displêi |
| WhatsApp | uótsap |
| 10h | as dez |

## Mixagem

A música abaixa sozinha enquanto a voz fala (sidechaincompress no ffmpeg, ver `comercial/display/renderizar.js`).
