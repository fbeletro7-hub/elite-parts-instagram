# Gera a fala do Téo com Kokoro (kokoro-onnx) e o movimento da boca.
# Uso: python3 fala.py pasta-modelos voz saida.wav saida.json "Frase 1." "Frase 2." ...
import sys, json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
MOD, VOZ, WAV, JS = sys.argv[1:5]; FRASES = sys.argv[5:]
k = Kokoro(f'{MOD}/kokoro-v1.0.onnx', f'{MOD}/voices-v1.0.bin')
SR = 24000; INI = 0.6; PAUSA = 0.35; FPS = 30
partes, legendas, t = [np.zeros(int(INI * SR))], [], INI
for f in FRASES:
    s, sr = k.create(f, voice=VOZ, speed=1.05, lang='pt-br'); assert sr == SR
    legendas.append([round(t, 3), round(t + len(s) / SR, 3), f])
    partes += [s, np.zeros(int(PAUSA * SR))]; t += len(s) / SR + PAUSA
a = np.concatenate(partes); a = a / np.abs(a).max() * 0.9
sf.write(WAV, a, SR)
n = int(len(a) / SR * FPS) + 1; hop = SR // FPS
rms = np.array([np.sqrt(np.mean(a[i*hop:(i+1)*hop]**2)) if i*hop < len(a) else 0 for i in range(n)])
boca = np.clip(rms / (np.percentile(rms[rms > 0.01], 90) + 1e-9), 0, 1)
boca = np.convolve(boca, [.25, .5, .25], 'same')
json.dump({'dur': len(a) / SR, 'legendas': legendas, 'boca': [round(float(x), 3) for x in boca]}, open(JS, 'w'))
print(len(a) / SR, legendas)
