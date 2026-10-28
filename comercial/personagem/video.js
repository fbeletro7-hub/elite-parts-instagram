// Vídeo do Téo falando (1080x1920). Uso: node video.js fala.wav fala.json saida.mp4
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const { teo } = require('./personagem.js');
const [wav, js, out] = process.argv.slice(2);
const F = JSON.parse(fs.readFileSync(js, 'utf8'));
const FPS = 30, FIM = 2.5, DUR = F.dur + FIM;
const sym = 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(__dirname, 'simbolo.svg')).toString('base64');
const mostra = s => s.replace(/Elíti Párts/g, 'Elite Parts').replace(/Displêi Elíti/g, 'Display Elite').replace(/uótsap/g, 'WhatsApp');
const PISCA = [1.4, 4.6, 7.9, 10.8, 13.0];
const JOINHA = F.legendas[Math.max(0, F.legendas.length - 2)][0];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Michroma&display=swap" rel="stylesheet">
<style>*{margin:0}body{width:1080px;height:1920px;overflow:hidden;position:relative;font-family:Michroma;color:#F2F5FA;
background:radial-gradient(circle at 50% 62%,#1d3a80 0%,#0f1d44 26%,#0A0D14 62%)}
#teo{position:absolute;left:0;top:600px;width:1080px;height:1350px}
#topo{position:absolute;left:72px;top:150px;display:flex;align-items:center;gap:20px;font-size:24px;letter-spacing:6px}
#leg{position:absolute;left:72px;right:72px;top:300px;font-size:66px;line-height:1.2}
#fim{position:absolute;left:60px;right:60px;bottom:120px;text-align:center;opacity:0}
</style></head><body>
<div id="topo"><img src="${sym}" style="height:70px"><span>ELITE PARTS</span></div>
<div id="leg"></div><div id="teo"></div>
<div id="fim"><div style="background:#3D7BFF;border-radius:99px;padding:34px;font-size:34px;letter-spacing:3px;box-shadow:0 20px 60px rgba(61,123,255,.45)">Chame no WhatsApp</div>
<div style="font-size:34px;margin-top:30px;text-shadow:0 2px 12px #000">@elitepartsofc</div></div></body></html>`);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', wav,
    '-af', `apad=pad_dur=${FIM}`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-c:a', 'aac', '-b:a', '192k', '-t', String(DUR), '-movflags', '+faststart', out],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < DUR * FPS; f++) {
    const t = f / FPS, boca = F.boca[f] || 0;
    const pisc = PISCA.reduce((m, x) => Math.max(m, 1 - Math.abs(t - x) / 0.08), 0);
    const leg = F.legendas.find(l => t >= l[0] - .1 && t < l[1] + .3) || null;
    const svg = teo({ boca, piscar: pisc, joinha: t >= JOINHA, olhar: Math.sin(t * .7) * .5, simbolo: sym });
    const op = Math.min(1, (t - F.dur) / .4);
    await p.evaluate(([svg, leg, bob, op]) => {
      document.getElementById('teo').innerHTML = svg;
      document.getElementById('teo').style.transform = `translateY(${bob}px)`;
      document.getElementById('leg').innerHTML = leg;
      document.getElementById('fim').style.opacity = Math.max(0, op);
    }, [svg, leg ? leg[2].replace(/([.?!])$/, '<span style="color:#3D7BFF">$1</span>') : '', Math.sin(t * 2.2) * 6 - boca * 6, op]);
    if (leg) await p.evaluate(s => document.getElementById('leg').innerHTML = s, mostra(leg[2]).replace(/^(.*?)(Display Elite|Elite Parts|Téo|WhatsApp)(.*)$/, '$1<span style="color:#3D7BFF">$2</span>$3'));
    const buf = await p.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
})();
