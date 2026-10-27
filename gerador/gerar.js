// Gera as artes do dia (1 post de feed + stories) no padrão Elite Parts.
// Uso: node gerar.js conteudo.json pasta-de-saida
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [, , specPath, outDir] = process.argv;
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
fs.mkdirSync(outDir, { recursive: true });
const simbolo = 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(__dirname, 'simbolo.svg')).toString('base64');

const phone = (w, h, rot, x, y, z) => `
  <div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform:rotate(${rot}deg);z-index:${z};
    border-radius:${w * 0.17}px;background:#151B29;border:${w * 0.03}px solid #1c2233;box-shadow:0 40px 80px rgba(0,0,0,.6)">
    <div style="position:absolute;inset:${w * 0.03}px;border-radius:${w * 0.14}px;overflow:hidden;
      background:conic-gradient(from 200deg at 55% 58%,#2B57B8,#0f1d44,#3D7BFF,#1b3577,#2D4F9E,#0f1d44,#2B57B8)"></div>
    <div style="position:absolute;top:${w * 0.09}px;left:50%;transform:translateX(-50%);width:${w * 0.3}px;height:${w * 0.08}px;border-radius:99px;background:#05070c"></div>
  </div>`;

const tampa = (w, h, rot, x, y, z) => `
  <div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform:rotate(${rot}deg);z-index:${z};
    border-radius:${w * 0.17}px;background:linear-gradient(150deg,#3D7BFF,#1b3577 55%,#0f1d44);border:${w * 0.02}px solid #2D4F9E;box-shadow:0 40px 80px rgba(0,0,0,.6)">
    <div style="position:absolute;top:${w * 0.07}px;left:${w * 0.07}px;width:${w * 0.42}px;height:${w * 0.42}px;border-radius:${w * 0.1}px;background:#0f1d44;border:2px solid #3D7BFF55">
      ${[[.08, .08], [.22, .22], [.08, .36]].map(([a, b]) => `<div style="position:absolute;left:${w * a}px;top:${w * b}px;width:${w * .14}px;height:${w * .14}px;border-radius:50%;background:radial-gradient(#3D7BFF55,#05070c 60%);border:2px solid #222b40"></div>`).join('')}
    </div>
  </div>`;

function ilustracao(tipo, W, cy, s) {
  const w = 280 * s, h = 580 * s, cx = W / 2;
  if (tipo === 'nenhuma') return '';
  if (tipo === 'tampas') return tampa(w * .9, h * .9, -12, cx - w * 1.05, cy - h * .4, 1) + tampa(w * .9, h * .9, 12, cx + w * .15, cy - h * .4, 1) + tampa(w, h, 0, cx - w / 2, cy - h / 2, 2);
  if (tipo === 'um') return phone(w * 1.1, h * 1.1, 0, cx - w * .55, cy - h * .55, 2);
  return phone(w * .9, h * .9, -8, cx - w * 1.15, cy - h * .38, 1) + phone(w * .9, h * .9, 8, cx + w * .25, cy - h * .38, 1) + phone(w, h, 0, cx - w / 2, cy - h / 2, 2);
}

function html(a, W, H) {
  const story = H > 1500;
  const top = story ? 300 : 90, side = 72;
  const pills = (a.selos || []).map(t => `<div style="border:3px solid #3D7BFF;border-radius:99px;padding:${story ? '22px 34px' : '18px 26px'};color:#F2F5FA;font-size:${story ? 30 : 24}px;letter-spacing:2px;white-space:nowrap">${t}</div>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Michroma&display=swap" rel="stylesheet">
<style>*{margin:0;box-sizing:border-box}body{width:${W}px;height:${H}px;overflow:hidden;font-family:'Michroma',sans-serif;
background:radial-gradient(circle at 50% ${story ? 55 : 57}%,#1d3a80 0%,#0f1d44 22%,#0A0D14 55%);position:relative;color:#F2F5FA}</style></head><body>
<div style="position:absolute;left:${side}px;right:${side}px;top:${top}px;z-index:5">
  <div style="color:#3D7BFF;font-size:${story ? 30 : 24}px;letter-spacing:${story ? 12 : 10}px">${a.etiqueta || ''}</div>
  <div style="font-size:${a.tamanhoTitulo || (story ? 68 : 78)}px;line-height:1.12;margin-top:${story ? 40 : 30}px;letter-spacing:-1px">${a.titulo1 || ''}<br><span style="color:#3D7BFF">${a.titulo2 || ''}</span></div>
  ${a.texto ? `<div style="color:#7F8BA3;font-size:${story ? 32 : 26}px;line-height:1.6;margin-top:30px">${a.texto}</div>` : ''}
</div>
${ilustracao(a.ilustracao || 'tres', W, story ? H * .6 : H * .52, story ? 1.05 : .95)}
${a.destaque ? `<div style="position:absolute;left:${side}px;right:${side}px;top:${story ? H * .4 : H * .38}px;z-index:4;text-align:center;font-size:${story ? 64 : 54}px;line-height:1.3;color:#F2F5FA">${a.destaque}</div>` : ''}
<div style="position:absolute;left:${side}px;right:${side}px;bottom:${story ? 380 : 150}px;z-index:5;display:flex;flex-wrap:wrap;gap:18px">${pills}</div>
${a.botao ? `<div style="position:absolute;left:${side}px;right:${side}px;bottom:${story ? 260 : 150}px;z-index:5;text-align:center;background:#3D7BFF;border-radius:99px;padding:30px;font-size:${story ? 34 : 28}px;letter-spacing:3px">${a.botao}</div>` : ''}
<div style="position:absolute;left:${side}px;bottom:${story ? 170 : 60}px;z-index:5;display:flex;align-items:center;gap:22px">
  <img src="${simbolo}" style="height:${story ? 80 : 70}px">
  <div style="font-size:${story ? 24 : 21}px;color:#F2F5FA">@elitepartsofc <span style="color:#7F8BA3;letter-spacing:4px">· ${a.rodape || 'PEÇAS PARA IPHONE'}</span></div>
</div></body></html>`;
}

(async () => {
  const b = await chromium.launch();
  const items = [];
  if (spec.feed) items.push({ nome: 'feed.png', W: 1080, H: 1350, a: spec.feed });
  (spec.stories || []).forEach((s, i) => items.push({ nome: `story-${i + 1}.png`, W: 1080, H: 1920, a: s }));
  for (const it of items) {
    const p = await b.newPage({ viewport: { width: it.W, height: it.H } });
    await p.setContent(html(it.a, it.W, it.H), { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(outDir, it.nome) });
    await p.close();
    console.log('ok', it.nome);
  }
  await b.close();
})();
