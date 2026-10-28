// Renderiza o comercial "Qualidade do display" (1080x1920, 30fps).
// Uso: node renderizar.js saida.mp4 [audio.wav]
//      node renderizar.js --previa pasta t1 t2 ...   (gera PNGs de alguns instantes)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const DUR = 36, FPS = 30;
const args = process.argv.slice(2);

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.join(__dirname, 'cena.html'));
  const sym = 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(__dirname, 'simbolo.svg')).toString('base64');
  await p.evaluate(s => document.querySelectorAll('img.sym').forEach(i => i.src = s), sym);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);

  if (args[0] === '--previa') {
    const dir = args[1]; fs.mkdirSync(dir, { recursive: true });
    for (const t of args.slice(2)) {
      await p.evaluate(t => render(t), +t);
      await p.screenshot({ path: path.join(dir, `t${t}.png`) });
    }
    await b.close(); return;
  }

  const [out, audio] = args;
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    ...(audio ? ['-i', audio] : []),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart',
    ...(audio ? ['-c:a', 'aac', '-b:a', '192k', '-shortest'] : []), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < DUR * FPS; f++) {
    await p.evaluate(t => render(t), f / FPS);
    const buf = await p.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log('quadro', f);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await b.close();
})();
