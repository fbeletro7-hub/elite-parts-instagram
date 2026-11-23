// Gera as artes do dia (1 post de feed + stories) no padrão Elite Parts.
// Uso: node gerar.js conteudo.json pasta-de-saida
//
// Variação visual (para o feed não ficar repetitivo):
//  - "estilo" no topo do conteudo.json (ou em cada arte): escuro | claro | azul
//  - "ilustracao" em cada arte: tres | um | tampas | pecas | lista | pergunta | numero | nenhuma
//      lista    -> linhas numeradas 01/02/03 com o texto de "itens" (ou "selos")
//      pergunta -> um "?" gigante (bom para enquete / "responde aqui")
//      numero   -> número grande em "numero" com a frase de "numeroLegenda"
//  - "alinhar": "centro" centraliza o título
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const ESTILOS = require('./estilos');

const simbolo = 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(__dirname, 'simbolo.svg')).toString('base64');

const phone = (E, w, h, rot, x, y, z) => `
  <div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform:rotate(${rot}deg);z-index:${z};
    border-radius:${w * 0.17}px;background:${E.corpo};border:${w * 0.03}px solid ${E.aro};box-shadow:0 40px 80px rgba(0,0,0,.45)">
    <div style="position:absolute;inset:${w * 0.03}px;border-radius:${w * 0.14}px;overflow:hidden;background:${E.tela}"></div>
    <div style="position:absolute;top:${w * 0.09}px;left:50%;transform:translateX(-50%);width:${w * 0.3}px;height:${w * 0.08}px;border-radius:99px;background:#05070c"></div>
  </div>`;

const tampa = (E, w, h, rot, x, y, z) => `
  <div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform:rotate(${rot}deg);z-index:${z};
    border-radius:${w * 0.17}px;background:linear-gradient(150deg,#3D7BFF,#1b3577 55%,#0f1d44);border:${w * 0.02}px solid #2D4F9E;box-shadow:0 40px 80px rgba(0,0,0,.45)">
    <div style="position:absolute;top:${w * 0.07}px;left:${w * 0.07}px;width:${w * 0.42}px;height:${w * 0.42}px;border-radius:${w * 0.1}px;background:#0f1d44;border:2px solid #3D7BFF55">
      ${[[.08, .08], [.22, .22], [.08, .36]].map(([a, b]) => `<div style="position:absolute;left:${w * a}px;top:${w * b}px;width:${w * .14}px;height:${w * .14}px;border-radius:50%;background:radial-gradient(#3D7BFF55,#05070c 60%);border:2px solid #222b40"></div>`).join('')}
    </div>
  </div>`;

function ilustracao(a, E, W, H, story) {
  const tipo = a.ilustracao || 'tres';
  const s = story ? 1.05 : .95, cy = story ? H * .6 : H * .52;
  const w = 280 * s, h = 580 * s, cx = W / 2;
  const side = 72;
  if (tipo === 'nenhuma') return '';
  if (tipo === 'tampas') return tampa(E, w * .9, h * .9, -12, cx - w * 1.05, cy - h * .4, 1) + tampa(E, w * .9, h * .9, 12, cx + w * .15, cy - h * .4, 1) + tampa(E, w, h, 0, cx - w / 2, cy - h / 2, 2);
  if (tipo === 'um') return phone(E, w * 1.1, h * 1.1, 0, cx - w * .55, cy - h * .55, 2);
  if (tipo === 'pecas') return phone(E, w, h, -10, cx - w * 1.0, cy - h * .5, 2) + tampa(E, w, h, 10, cx + w * .02, cy - h * .45, 1);
  if (tipo === 'lista') {
    const itens = a.itens || a.selos || [];
    const top = story ? H * .4 : H * .39;
    return `<div style="position:absolute;left:${side}px;right:${side}px;top:${top}px;z-index:4">` + itens.map((t, i) => `
      <div style="display:flex;align-items:center;gap:${story ? 40 : 34}px;padding:${story ? 44 : 30}px 0;border-top:3px solid ${E.borda}33">
        <div style="font-size:${story ? 120 : 92}px;color:${E.destaque};line-height:1;min-width:${story ? 190 : 150}px">${String(i + 1).padStart(2, '0')}</div>
        <div style="font-size:${story ? 46 : 38}px;line-height:1.3;color:${E.texto}">${t}</div>
      </div>`).join('') + `<div style="border-top:3px solid ${E.borda}33"></div></div>`;
  }
  if (tipo === 'pergunta') return `<div style="position:absolute;left:0;right:0;top:${cy - (story ? 420 : 330)}px;text-align:center;z-index:1;
      font-size:${story ? 760 : 560}px;line-height:1;color:transparent;-webkit-text-stroke:${story ? 10 : 8}px ${E.destaque}">?</div>`;
  if (tipo === 'numero') return `<div style="position:absolute;left:${side}px;right:${side}px;top:${cy - (story ? 300 : 230)}px;text-align:center;z-index:1">
      <div style="font-size:${story ? 400 : 300}px;line-height:1;color:${E.destaque}">${a.numero || ''}</div>
      <div style="font-size:${story ? 44 : 36}px;line-height:1.35;color:${E.texto};margin-top:30px">${a.numeroLegenda || ''}</div></div>`;
  return phone(E, w * .9, h * .9, -8, cx - w * 1.15, cy - h * .38, 1) + phone(E, w * .9, h * .9, 8, cx + w * .25, cy - h * .38, 1) + phone(E, w, h, 0, cx - w / 2, cy - h / 2, 2);
}

function html(a, W, H, estiloDia) {
  const story = H > 1500;
  const E = ESTILOS[a.estilo || estiloDia] || ESTILOS.escuro;
  const top = story ? 300 : 90, side = 72;
  const centro = a.alinhar === 'centro';
  const mostraSelos = a.ilustracao !== 'lista';
  const pills = mostraSelos ? (a.selos || []).map(t => `<div style="border:3px solid ${E.borda};border-radius:99px;padding:${story ? '22px 34px' : '18px 26px'};color:${E.texto};font-size:${story ? 30 : 24}px;letter-spacing:2px;white-space:nowrap">${t}</div>`).join('') : '';
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Michroma&display=swap" rel="stylesheet">
<style>*{margin:0;box-sizing:border-box}body{width:${W}px;height:${H}px;overflow:hidden;font-family:'Michroma',sans-serif;
background:${E.fundo(story)};position:relative;color:${E.texto}}
.grade{position:absolute;inset:0;background-image:linear-gradient(${E.grade} 2px,transparent 2px),linear-gradient(90deg,${E.grade} 2px,transparent 2px);background-size:90px 90px}</style></head><body>
${a.ilustracao === 'lista' || a.ilustracao === 'numero' || a.ilustracao === 'pergunta' ? '<div class="grade"></div>' : ''}
<div style="position:absolute;left:${side}px;right:${side}px;top:${top}px;z-index:5;${centro ? 'text-align:center' : ''}">
  <div style="color:${E.etiqueta};font-size:${story ? 30 : 24}px;letter-spacing:${story ? 12 : 10}px">${a.etiqueta || ''}</div>
  <div style="font-size:${a.tamanhoTitulo || (story ? 68 : 78)}px;line-height:1.12;margin-top:${story ? 40 : 30}px;letter-spacing:-1px">${a.titulo1 || ''}<br><span style="color:${E.destaque}">${a.titulo2 || ''}</span></div>
  ${a.texto ? `<div style="color:${E.sec};font-size:${story ? 32 : 26}px;line-height:1.6;margin-top:30px">${a.texto}</div>` : ''}
</div>
${ilustracao(a, E, W, H, story)}
${a.destaque ? `<div style="position:absolute;left:${side}px;right:${side}px;top:${story ? H * .4 : H * .38}px;z-index:4;text-align:center;font-size:${story ? 64 : 54}px;line-height:1.3;color:${E.texto}">${a.destaque.replace(/#3D7BFF/g, E.destaque)}</div>` : ''}
<div style="position:absolute;left:${side}px;right:${side}px;bottom:${story ? 380 : 150}px;z-index:5;display:flex;flex-wrap:wrap;gap:18px">${pills}</div>
${a.botao ? `<div style="position:absolute;left:${side}px;right:${side}px;bottom:${story ? 260 : 150}px;z-index:5;text-align:center;background:${E.botao};color:${E.botaoTexto};border-radius:99px;padding:30px;font-size:${story ? 34 : 28}px;letter-spacing:3px">${a.botao}</div>` : ''}
<div style="position:absolute;left:${side}px;bottom:${story ? 170 : 60}px;z-index:5;display:flex;align-items:center;gap:22px">
  <img src="${simbolo}" style="height:${story ? 80 : 70}px">
  <div style="font-size:${story ? 24 : 21}px;color:${E.texto}">@elitepartsofc <span style="color:${E.sec};letter-spacing:4px">· ${a.rodape || 'PEÇAS PARA IPHONE'}</span></div>
</div></body></html>`;
}

(async () => {
  const [, , specPath, outDir] = process.argv;
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  fs.mkdirSync(outDir, { recursive: true });
  const b = await chromium.launch();
  const items = [];
  if (spec.feed) items.push({ nome: 'feed.png', W: 1080, H: 1350, a: spec.feed });
  (spec.stories || []).forEach((s, i) => items.push({ nome: `story-${i + 1}.png`, W: 1080, H: 1920, a: s }));
  for (const it of items) {
    const p = await b.newPage({ viewport: { width: it.W, height: it.H } });
    await p.setContent(html(it.a, it.W, it.H, spec.estilo), { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(outDir, it.nome) });
    await p.close();
    console.log('ok', it.nome);
  }
  await b.close();
})();
