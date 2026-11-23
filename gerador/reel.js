// Gera o Reel do dia (1080x1920, 30 fps, com música) a partir do bloco "reel" do conteudo.json.
// Uso: node gerador/reel.js AAAA-MM-DD/conteudo.json AAAA-MM-DD/
// Saída: reel.mp4 e reel-capa.jpg
//
// Formato do bloco "reel":
// "reel": {
//   "estilo": "escuro" | "claro" | "azul"   (opcional; padrão = estilo do dia)
//   "musica": "a" | "b"                     (gerador/musica/musica-X.m4a)
//   "cenas": [
//     { "etiqueta": "...", "titulo": ["linha branca", "*linha azul*"], "texto": "legenda curta",
//       "visual": "celular|rachada|erro|tampas|pecas|lista|pergunta|numero|logo|check",
//       "itens": ["..."] (para lista), "numero": "3" (para numero) }
//   ],
//   "final": { "titulo": ["Precisa de peça?", "*Chama no Whats.*"], "sub": "displays, tampas e componentes" }
// }
// Cada cena dura o tempo de leitura do texto. O final com o Téo e o botão do WhatsApp entra sozinho.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { spawnSync, spawn } = require('child_process');
const ESTILOS = require('./estilos');

const [, , specPath, outDir] = process.argv;
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const reel = spec.reel;
if (!reel) { console.error('conteudo.json sem bloco "reel"'); process.exit(1); }
fs.mkdirSync(outDir, { recursive: true });
const FPS = 30;
const E = ESTILOS[reel.estilo || spec.estilo] || ESTILOS.escuro;
const b64 = (f, m) => `data:${m};base64,` + fs.readFileSync(path.join(__dirname, f)).toString('base64');
const IMG = { simbolo: b64('simbolo.svg', 'image/svg+xml'), teo: b64('teo-joinha.jpg', 'image/jpeg') };

// ---------- linha do tempo ----------
const palavras = (s) => (s || '').split(/\s+/).filter(Boolean).length;
let t0 = 0;
const cenas = reel.cenas.map((c, i) => {
  const n = palavras((c.titulo || []).join(' ').replace(/\*/g, '')) + palavras(c.texto) + palavras(c.etiqueta) + palavras((c.itens || []).join(' '));
  let dur = Math.min(5.5, Math.max(2.8, 1.2 + n * 0.27));
  if (c.visual === 'lista') dur = Math.max(dur, 1.6 + 1.1 * (c.itens || []).length);
  if (i === 0) dur = Math.max(dur, 3.0);
  const cena = { ...c, ini: t0, dur: Math.round(dur * 100) / 100 };
  t0 += cena.dur;
  return cena;
});
const final = { ...(reel.final || {}), visual: 'final', ini: t0, dur: 4.6 };
cenas.push(final);
const TOTAL = t0 + final.dur;

const pagina = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Michroma&family=Inter:wght@500;700;800&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1920px;overflow:hidden;font-family:Inter,sans-serif;color:${E.texto};background:#0A0D14}
.etq{font-family:Michroma;font-size:28px;letter-spacing:9px;color:${E.etiqueta};margin-bottom:30px}
.tit{font-family:Michroma;font-size:74px;line-height:1.16;letter-spacing:-1px}
.az{color:${E.destaque}}
</style></head><body><div id="r"></div><script>
const E=${JSON.stringify({ ...E, fundo: E.fundo(true), fundoEscuro: ESTILOS.escuro.fundo(true) })};
const IMG=${JSON.stringify(IMG)};
const C=${JSON.stringify(cenas)};
const TOTAL=${TOTAL};
const cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const ease=x=>1-Math.pow(1-cl(x),3);
const pop=x=>{x=cl(x);return x===0?0:1+2.2*Math.pow(x-1,3)+1.2*Math.pow(x-1,2)};

function phone(x,y,w,rot,tela,extra=''){
  const h=w*2.05;
  return '<div style="position:absolute;left:'+(x-w/2)+'px;top:'+(y-h/2)+'px;width:'+w+'px;height:'+h+'px;transform:rotate('+rot+'deg);'+extra+
   'border-radius:'+w*.16+'px;background:'+E.corpo+';border:'+w*.035+'px solid '+E.aro+';box-shadow:0 0 90px #3D7BFF44,0 40px 80px rgba(0,0,0,.5)">'+
   '<div style="position:absolute;inset:'+w*.025+'px;border-radius:'+w*.13+'px;overflow:hidden">'+tela+'</div>'+
   '<div style="position:absolute;top:'+w*.06+'px;left:50%;transform:translateX(-50%);width:'+w*.3+'px;height:'+w*.085+'px;border-radius:99px;background:#05070c"></div></div>';
}
const telaAzul=t=>'<div style="position:absolute;inset:-20%;background:conic-gradient(from '+(200+t*25)+'deg at 50% 55%,#2B57B8,#0f1d44,#3D7BFF,#1b3577,#2D4F9E,#0f1d44,#2B57B8)"></div>';
function tampa(x,y,w,rot){
  const h=w*2.05;
  const lente=(a,b)=>'<div style="position:absolute;left:'+w*a+'px;top:'+w*b+'px;width:'+w*.14+'px;height:'+w*.14+'px;border-radius:50%;background:radial-gradient(#3D7BFF66,#05070c 60%);border:2px solid #222b40"></div>';
  return '<div style="position:absolute;left:'+(x-w/2)+'px;top:'+(y-h/2)+'px;width:'+w+'px;height:'+h+'px;transform:rotate('+rot+'deg);border-radius:'+w*.16+'px;'+
   'background:linear-gradient(150deg,#3D7BFF,#1b3577 55%,#0f1d44);border:'+w*.02+'px solid #2D4F9E;box-shadow:0 40px 80px rgba(0,0,0,.5)">'+
   '<div style="position:absolute;top:'+w*.07+'px;left:'+w*.07+'px;width:'+w*.42+'px;height:'+w*.42+'px;border-radius:'+w*.1+'px;background:#0f1d44;border:2px solid #3D7BFF55">'+
   lente(.08,.08)+lente(.22,.22)+lente(.08,.36)+'</div>'+
   '<img src="'+IMG.simbolo+'" style="position:absolute;left:50%;top:55%;width:'+w*.18+'px;transform:translate(-50%,-50%);opacity:.45"></div>';
}
function rachaduras(k){
  const L=[ 'M62 70 L40 25 L33 0','M62 70 L92 45 L100 43','M62 70 L70 120 L58 165 L64 200','M62 70 L18 95 L0 100','M62 70 L96 125','M40 25 L18 35','M70 120 L96 148','M18 95 L30 145 L10 200'];
  return '<svg viewBox="0 0 100 200" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%"><g stroke="#fff" stroke-width=".7" fill="none" stroke-linecap="round">'+
   L.map(d=>'<path d="'+d+'" pathLength="1" stroke-dasharray="1" stroke-dashoffset="'+(1-k)+'"/>').join('')+'</g></svg>';
}

function titulo(c,lt,primeira){
  if(!c.titulo) return '';
  const linhas=c.titulo.map((l,i)=>{
    const az=l.startsWith('*'); const k=primeira?1:ease((lt-0.1*i)/0.45);
    return '<div style="opacity:'+k+';transform:translateY('+(1-k)*40+'px)"'+(az?' class="az"':'')+'>'+l.replace(/\\*/g,'')+'</div>';
  }).join('');
  const e=c.etiqueta?'<div class="etq" style="opacity:'+(primeira?1:ease(lt/0.3))+'">'+c.etiqueta+'</div>':'';
  return '<div style="position:absolute;left:84px;right:70px;top:290px">'+e+'<div class="tit">'+linhas+'</div></div>';
}
function legenda(c,lt,primeira){
  if(!c.texto) return '';
  const k=primeira?1:ease((lt-0.35)/0.4);
  return '<div style="position:absolute;left:70px;right:70px;top:1470px;text-align:center;opacity:'+k+';transform:translateY('+(1-k)*30+'px)">'+
   '<span style="display:inline-block;background:rgba(5,8,16,.82);border:2px solid #3D7BFF66;border-radius:24px;padding:22px 36px;font:700 44px/1.3 Inter;color:#fff;max-width:940px">'+c.texto+'</span></div>';
}

function visual(c,lt,t,primeira){
  const k=primeira?1:ease(lt/0.6), y=(1-k)*140, cy=1050;
  switch(c.visual){
    case 'rachada': return phone(540,cy+y,400,-4+Math.sin(t*2)*2,telaAzul(t)+'<div style="position:absolute;inset:0;background:#ff3d5e22"></div>'+rachaduras(primeira?1:ease((lt-0.3)/0.8)));
    case 'erro': { const kx=pop((lt-0.5)/0.4), sh=lt>0.5&&lt<0.9?Math.sin(lt*80)*10:0;
      return phone(540+sh,cy+y,380,0,telaAzul(t))+'<div style="position:absolute;left:0;right:0;top:'+(cy-230)+'px;text-align:center;font:800 440px/440px Inter;color:#ff4d5e;text-shadow:0 0 50px #ff4d5e;transform:scale('+kx+')">×</div>'; }
    case 'check': { const kx=pop((lt-0.4)/0.45);
      return phone(540,cy+y,380,0,telaAzul(t))+'<svg viewBox="0 0 100 100" style="position:absolute;left:340px;top:'+(cy-200)+'px;width:400px;height:400px;transform:scale('+kx+');filter:drop-shadow(0 0 30px #25D366)"><circle cx="50" cy="50" r="44" fill="#25D366"/><path d="M28 52 L44 67 L73 36" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
    case 'tampas': { const a=primeira?1:ease((lt-0.2)/0.7);
      return tampa(540-200*a,cy+30,330,-12*a)+tampa(540+200*a,cy+30,330,12*a)+tampa(540,cy+y,360,0); }
    case 'pecas': { const a=primeira?1:ease(lt/0.7);
      return phone(540-190-300*(1-a),cy,340,-8,telaAzul(t))+tampa(540+190+300*(1-a),cy+20,340,8); }
    case 'lista': {
      const it=c.itens||[];
      return '<div style="position:absolute;left:84px;right:84px;top:760px">'+it.map((s,i)=>{
        const ki=primeira&&i===0?1:ease((lt-0.6-1.0*i)/0.4), kc=pop((lt-0.8-1.0*i)/0.35);
        return '<div style="display:flex;align-items:center;gap:36px;padding:34px 0;border-top:3px solid #3D7BFF44;opacity:'+ki+';transform:translateX('+(1-ki)*-80+'px)">'+
         '<svg viewBox="0 0 100 100" style="width:110px;height:110px;flex:none;transform:scale('+kc+')"><circle cx="50" cy="50" r="46" fill="#3D7BFF"/><path d="M28 52 L44 67 L73 36" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'+
         '<div style="font:700 50px/1.25 Inter;color:'+E.texto+'">'+s+'</div></div>';
      }).join('')+'</div>'; }
    case 'pergunta': { const s=1+Math.sin(t*4)*.04;
      return '<div style="position:absolute;left:0;right:0;top:'+(cy-450+y)+'px;text-align:center;font:800 900px/900px Inter;color:transparent;-webkit-text-stroke:14px '+E.destaque+';transform:scale('+s+');opacity:'+k+'">?</div>'; }
    case 'numero': { const kn=primeira?1:pop((lt-0.2)/0.5);
      return '<div style="position:absolute;left:0;right:0;top:'+(cy-300)+'px;text-align:center;font-family:Michroma;font-size:440px;line-height:1;color:'+E.destaque+';transform:scale('+kn+')">'+(c.numero||'')+'</div>'; }
    case 'logo': { const kl=primeira?1:pop(lt/0.6);
      return '<img src="'+IMG.simbolo+'" style="position:absolute;left:290px;top:'+(cy-250)+'px;width:500px;transform:scale('+kl+');filter:drop-shadow(0 0 60px #3D7BFF)">'; }
    default: return phone(540,cy+y,420,Math.sin(t*1.5)*3,telaAzul(t),'');
  }
}

function telaFinal(c,lt,t){
  const k=ease(lt/0.5), bob=Math.sin(t*3)*6, kb=pop((lt-0.6)/0.5);
  const tit=c.titulo||['Precisa de peça?','*Chama no Whats.*'];
  let s='<div style="position:absolute;inset:0;background:'+E.fundoEscuro+'"></div>';
  s+='<div style="position:absolute;left:0;right:0;top:290px;text-align:center"><img src="'+IMG.simbolo+'" style="height:120px;opacity:'+k+'"></div>';
  s+='<div style="position:absolute;left:60px;right:60px;top:460px;text-align:center;color:#F2F5FA"><div class="tit" style="font-size:72px">'+
    tit.map((l,i)=>{const kk=ease((lt-0.1*i)/0.45);return '<div style="opacity:'+kk+';transform:translateY('+(1-kk)*40+'px)'+(l.startsWith('*')?';color:#3D7BFF':'')+'">'+l.replace(/\\*/g,'')+'</div>'}).join('')+
    '</div><div style="font:500 40px Inter;color:#9fb0d0;margin-top:26px;opacity:'+ease((lt-0.3)/0.5)+'">'+(c.sub||'Displays, tampas e componentes para iPhone')+'</div></div>';
  s+='<div style="position:absolute;left:180px;top:'+(800+(1-k)*200+bob)+'px;width:720px;height:900px;-webkit-mask-image:radial-gradient(ellipse 50% 58% at 50% 50%,#000 70%,transparent 100%)"><img src="'+IMG.teo+'" style="width:720px"></div>';
  s+='<div style="position:absolute;left:0;right:0;top:1480px;text-align:center"><div style="display:inline-block;transform:scale('+kb+');background:#25D366;color:#fff;font:800 48px Inter;padding:32px 66px;border-radius:99px;box-shadow:0 10px 40px #25D36677">Chame no WhatsApp</div>'+
    '<div style="font:600 36px Inter;color:#cfd8ea;margin-top:28px;opacity:'+cl(kb)+'">@elitepartsofc  ·  link na bio</div></div>';
  return s;
}

window.render=function(t){
  let i=C.length-1; while(i>0&&t<C[i].ini) i--;
  const c=C[i], lt=t-c.ini, primeira=i===0;
  const fora=c.visual==='final'?1:1-ease((lt-(c.dur-0.25))/0.25);
  const glowX=50+Math.sin(t*.6)*12, glowY=55+Math.cos(t*.5)*6;
  let h='<div style="position:absolute;inset:0;background:'+E.fundo+'"></div>'+
    '<div style="position:absolute;inset:0;background:radial-gradient(circle at '+glowX+'% '+glowY+'%,#3D7BFF33,transparent 45%)"></div>';
  if(c.visual==='final') h+=telaFinal(c,lt,t);
  else h+='<div style="opacity:'+fora+'">'+visual(c,lt,t,primeira)+titulo(c,lt,primeira)+legenda(c,lt,primeira)+'</div>'+
    '<div style="position:absolute;left:84px;bottom:190px;display:flex;align-items:center;gap:18px;opacity:.9"><img src="'+IMG.simbolo+'" style="height:60px"><span style="font-family:Michroma;font-size:22px;color:'+E.texto+'">@elitepartsofc</span></div>';
  document.getElementById('r').innerHTML=h;
};
</script></body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.setContent(pagina, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const mudo = path.join(outDir, '_reel-mudo.mp4');
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(FPS), mudo], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(TOTAL * FPS);
  for (let f = 0; f < N; f++) {
    await page.evaluate((t) => window.render(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 90 });
    if (f === 0) fs.writeFileSync(path.join(outDir, 'reel-capa.jpg'), buf);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  await browser.close();

  // música: repete com crossfade se precisar, corta no tamanho do vídeo e faz fade no final
  const musica = path.join(__dirname, 'musica', `musica-${reel.musica || 'a'}.m4a`);
  const D = TOTAL.toFixed(2);
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', mudo, '-i', musica, '-i', musica, '-filter_complex',
    `[1:a][2:a]acrossfade=d=1.5[m];[m]atrim=0:${D},asetpts=PTS-STARTPTS,afade=t=in:d=0.3,afade=t=out:st=${(TOTAL - 1.8).toFixed(2)}:d=1.8,alimiter=limit=0.95[a]`,
    '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-movflags', '+faststart', '-shortest',
    path.join(outDir, 'reel.mp4')], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(1);
  fs.unlinkSync(mudo);
  console.log('ok reel.mp4', TOTAL.toFixed(1) + 's', cenas.map((c) => c.dur));
})();
