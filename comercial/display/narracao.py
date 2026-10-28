# Gera a narração (voz padrão Elite Parts) alinhada às cenas.
# Uso: python3 narracao.py pasta-da-voz saida.wav
# Voz padrão: Piper, modelo pt_BR-faber-medium, length_scale 0.95 (ver comercial/VOZ-PADRAO.md)
import subprocess, sys, wave, numpy as np, os, tempfile
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
SR = 22050
track = np.zeros(int(DUR * SR))
fim_ant = 0
with tempfile.TemporaryDirectory() as tmp:
    for i, (t, txt) in enumerate(FALAS):
        f = os.path.join(tmp, f'{i}.wav')
        subprocess.run([sys.executable, '-m', 'piper', '-m', os.path.join(VOZ, 'pt_BR-faber-medium.onnx'),
                        '--length-scale', '0.95', '--sentence-silence', '0.15', '-f', f],
                       input=txt.encode(), check=True, capture_output=True)
        w = wave.open(f); assert w.getframerate() == SR
        s = np.frombuffer(w.readframes(w.getnframes()), '<i2') / 32768; w.close()
        a = int(t * SR); d = len(s) / SR
        print(f'{t:5.1f}s – {t + d:5.1f}s  {txt}' + ('   <<< SOBREPÕE' if t < fim_ant else ''))
        fim_ant = t + d
        track[a:a + len(s)] += s[:len(track) - a]
track /= max(1e-9, np.abs(track).max()) / 0.9
w = wave.open(OUT, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((track * 32767).astype('<i2').tobytes()); w.close()
