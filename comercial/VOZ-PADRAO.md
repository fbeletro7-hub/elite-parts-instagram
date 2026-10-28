# Voz padrão dos vídeos Elite Parts

Toda narração de vídeo da Elite Parts usa esta voz, sempre com os mesmos ajustes.

| Item | Valor |
|---|---|
| Ferramenta | Piper TTS (`pip install piper-tts`), roda offline, sem conta nem custo |
| Voz | `pt_BR-faber-medium` (masculina, português do Brasil) |
| Licença | CC0, livre para uso comercial |
| Velocidade | `--length-scale 0.95` |
| Pausa entre frases | `--sentence-silence 0.15` |
| Arquivos do modelo | `/mnt/project-files/voz/pt_BR-faber-medium.onnx` e `.onnx.json` |
| Download de reserva | https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-pt_BR-faber-medium.tar.bz2 |

## Como gerar

    echo "Texto da fala" | python3 -m piper -m /mnt/project-files/voz/pt_BR-faber-medium.onnx \
      --length-scale 0.95 --sentence-silence 0.15 -f fala.wav

Para um vídeo com várias falas em tempos certos, use `comercial/display/narracao.py` como modelo.

## Pronúncia (escrever assim no texto da fala)

| Palavra | Escrever |
|---|---|
| Elite Parts | Elíti Párts |
| Display | Displêi |
| WhatsApp | uótsap |
| 10h | as dez |
| @elitepartsofc | arroba elíti párts ó efe cê |

## Mixagem

A voz entra por cima da trilha e a música abaixa sozinha enquanto ela fala
(sidechaincompress no ffmpeg, ver `comercial/display/renderizar.js`).
