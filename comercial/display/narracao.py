# Gera a narração (voz padrão Elite Parts) alinhada às cenas.
# Uso: python3 narracao.py pasta-dos-modelos-kokoro saida.wav
# Voz padrão: Kokoro v1.0, voz pm_alex, velocidade 1.05 (ver comercial/VOZ-PADRAO.md)
import sys, wave, numpy as np
from kokoro_onnx import Kokoro
VOZ, OUT = sys.argv[1], sys.argv[2]
DUR = 40.0
# (início em segundos, texto). A grafia de algumas palavras é ajustada para soar certo.
FALAS = [
    (0.4,  "Tela trincada? Cliente esperando?"),
    (3.9,  "Elíti Párts. A troca perfeita."),
    (6.4,  "Troca simples, do jeito certo."),
    (10.2, "Sai a tela trincada."),
    (13.6, "Entra o Displêi Elíti."),
    (17.5, "Liga de primeira."),
    (20.5, "Imagem nítida, brilho intenso e toque preciso."),
    (23.8, "Compare. A diferença aparece."),
    (28.8, "Menos retorno, mais cliente feliz."),
    (32.0, "Peça seu Displêi Elíti. Pedido até as dez, entrega no mesmo dia. Chame no uótsap!"),
]
SR = 24000
k = Kokoro(f'{VOZ}/kokoro-v1.0.onnx', f'{VOZ}/voices-v1.0.bin')
track = np.zeros(int(DUR * SR))
fim_ant = 0
for t, txt in FALAS:
    s, sr = k.create(txt, voice='pm_alex', speed=1.05, lang='pt-br'); assert sr == SR
    a = int(t * SR); d = len(s) / SR
    print(f'{t:5.1f}s – {t + d:5.1f}s  {txt}' + ('   <<< SOBREPÕE' if t < fim_ant else ''))
    fim_ant = t + d
    track[a:a + len(s)] += s[:len(track) - a]
track /= max(1e-9, np.abs(track).max()) / 0.9
# boca do Téo (30 quadros por segundo) para o vídeo
import json
hop = SR // 30; n = len(track) // hop
rms = np.array([np.sqrt(np.mean(track[i*hop:(i+1)*hop]**2)) for i in range(n)])
boca = np.convolve(np.clip(rms / (np.percentile(rms[rms > 0.01], 90) + 1e-9), 0, 1), [.25, .5, .25], 'same')
json.dump([round(float(x), 3) for x in boca], open(OUT.rsplit('.', 1)[0] + '.json', 'w'))
w = wave.open(OUT, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((track * 32767).astype('<i2').tobytes()); w.close()
