# Gera a trilha (música + efeitos) do comercial. Uso: python3 trilha.py saida.wav
import numpy as np, sys, wave
SR=44100; DUR=36.0; N=int(SR*DUR)
rng=np.random.default_rng(3)
L=np.zeros(N); R=np.zeros(N)
def add(sig,t,g=1.0,pan=0.0):
    i=int(t*SR); s=sig[:max(0,min(len(sig),N-i))]*g
    L[i:i+len(s)]+=s*(1-pan)/1; R[i:i+len(s)]+=s*(1+pan)/1
def env(n,a,d):
    e=np.ones(n); na=int(a*SR); e[:na]=np.linspace(0,1,na) if na else 1
    return e*np.exp(-np.arange(n)/(d*SR))
def tone(f,dur,a=.005,d=.3,wave_='sin'):
    n=int(dur*SR); t=np.arange(n)/SR
    if wave_=='saw': s=sum(np.sin(2*np.pi*f*k*t)/k for k in range(1,8))*.6
    else: s=np.sin(2*np.pi*f*t)
    return s*env(n,a,d)
def noise(dur): return rng.standard_normal(int(dur*SR))
def lp(x,a): # passa-baixa simples
    y=np.empty_like(x); acc=0.
    for i in range(len(x)): acc+= a*(x[i]-acc); y[i]=acc
    return y
BPM=110; beat=60/BPM
# kick
kn=int(.35*SR); kt=np.arange(kn)/SR
kick=np.sin(2*np.pi*(45*kt+60*(1-np.exp(-kt*30))/30*1))*np.exp(-kt*9)
hat=np.diff(noise(.06),prepend=0)*env(int(.06*SR),0,.015)*.25
chords=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]  # Am F C G
mf=lambda m:440*2**((m-69)/12)
start=6.2; end=31.6
b=0; t=0.
while t<DUR:
    t=b*beat
    if t>=DUR: break
    bar=int(b//4); ch=chords[bar%4]
    if 3.6<=t<end+2:
        if t>=start or b%2==0: add(kick,t,.9 if t>=start else .5)
    if start<=t<end+2:
        add(hat,t+beat/2,.6,.3)
        if b%4==0:
            for m in ch: add(tone(mf(m),beat*4,a=.3,d=3,wave_='saw')*.05,t,1,(m%3-1)*.4)
        add(tone(mf(ch[0]-24),beat*.9,a=.01,d=.35,wave_='saw')*.35,t)
    b+=1
# pad suave no começo e no fim
for m in [57,60,64,69]: add(tone(mf(m),3.6,a=.8,d=6)*.04,0)
for m in [57,60,64,69,72]: add(tone(mf(m),4.4,a=.1,d=3)*.05,31.6)
# whoosh
def whoosh(d=.6):
    n=noise(d); e=np.sin(np.linspace(0,np.pi,len(n)))**2; return lp(n*e,.08)*.9
for tt in [3.45,6.0,10.3,12.6,13.3,23.5,31.4]: add(whoosh(),tt,.5)
# glitch da tela quebrada
for k in range(10):
    tt=.2+k*.33; add(np.sign(np.sin(2*np.pi*(60+30*k)*np.arange(int(.08*SR))/SR))*env(int(.08*SR),0,.04)*.06,tt)
# parafusos
for a,bb in [(7.0,7.3),(7.6,7.95)]:
    tt=a
    while tt<bb: add(np.diff(noise(.02),prepend=0)*env(int(.02*SR),0,.005)*.25,tt); tt+=.045
# ventosa (pop)
add(tone(300,.12,0,.03)*.4+tone(180,.12,0,.05)*.3,9.65)
# cliques
def click(): return np.diff(noise(.03),prepend=0)*env(int(.03*SR),0,.004)*.6+tone(2200,.03,0,.008)*.3
add(click(),12.3); add(click(),14.75)
add(tone(mf(81),.5,0,.25)*.12,14.78); add(tone(mf(88),.6,0,.3)*.1,14.9)
# liga
for i,m in enumerate([69,76,81,88]): add(tone(mf(m),1.5,0.01,.8)*.1,17.4+i*.12)
# toques
for tt in [19.65,20.25,20.85]: add(tone(1600,.08,0,.02)*.15+tone(2400,.08,0,.015)*.08,tt)
# impacto final
add(kick,31.6,1.2); add(lp(noise(1.2)*env(int(1.2*SR),0,.4),.2),31.6,.4)
# master
fade=np.ones(N); fl=int(1.5*SR); fade[-fl:]=np.linspace(1,0,fl)
st=np.stack([L,R],1)*fade[:,None]
st=np.tanh(st*1.4)/np.tanh(1.4); st/=np.max(np.abs(st))*1.12
w=wave.open(sys.argv[1],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((st*32767).astype('<i2').tobytes()); w.close()
