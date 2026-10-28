import sys, json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
m=sys.argv[1]; out=sys.argv[2]; frases=sys.argv[3:]
k=Kokoro(f"{m}/kokoro-v1.0.onnx", f"{m}/voices-v1.0.bin")
parts=[]; t=0.3; tim=[]; sr=24000
parts.append(np.zeros(int(0.3*sr),dtype=np.float32))
for f in frases:
    a,sr=k.create(f, voice="pm_alex", speed=1.05, lang="pt-br")
    tim.append([round(t,3), round(t+len(a)/sr,3)])
    parts.append(a.astype(np.float32)); t+=len(a)/sr
    parts.append(np.zeros(int(0.35*sr),dtype=np.float32)); t+=0.35
sf.write(out, np.concatenate(parts), sr)
json.dump(tim, open(out+".json","w")); print(tim)
