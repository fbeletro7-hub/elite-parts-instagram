import numpy as np, soundfile as sf
sr=44100; D=16.6; n=int(sr*D); out=np.zeros(n); sfx=np.zeros(n)
bpm=126; beat=60/bpm; rng=np.random.default_rng(1)
def add(buf,sig,start):
    i=int(start*sr); j=min(n,i+len(sig)); 
    if i<n: buf[i:j]+=sig[:j-i]
def env(d,dec): tt=np.arange(int(d*sr))/sr; return tt,np.exp(-tt*dec)
def kick():
    tt,e=env(0.4,8); f=45+110*np.exp(-tt*35); return np.tanh(2*np.sin(2*np.pi*np.cumsum(f)/sr)*e)*0.9
def clap():
    tt,e=env(0.2,25); return rng.standard_normal(len(tt))*e*0.25
def hat():
    tt,e=env(0.05,80); x=np.diff(np.r_[0,rng.standard_normal(len(tt))]); return x*e*0.1
def saw(fr,d,a):
    tt=np.arange(int(d*sr))/sr; w=sum(np.sin(2*np.pi*fr*k*tt)/k for k in range(1,8))
    e=np.minimum(1,tt/0.01)*np.exp(-tt*3); return w*e*a
def sub(fr,d,a):
    tt=np.arange(int(d*sr))/sr; return np.sin(2*np.pi*fr*tt)*np.minimum(1,tt/0.01)*np.exp(-tt*2.5)*a
mf=lambda m:440*2**((m-69)/12)
prog=[(45,(57,60,64)),(41,(53,57,60)),(48,(55,60,64)),(43,(55,59,62))]
tm=0.0; b=0
while tm<D-0.3:
    bar=b//4; root,ch=prog[bar%4]
    add(out,kick(),tm)
    if b%2==1: add(out,clap(),tm)
    add(out,hat(),tm+beat/2); 
    add(out,sub(mf(root),beat*0.95,0.35),tm)
    for k in range(2):  # stabs offbeat
        for m in ch: add(out,saw(mf(m+12),0.12,0.03),tm+beat*0.5*k+beat*0.25)
    b+=1; tm+=beat
# whoosh / riser on cuts
def whoosh():
    tt,_=env(0.45,1); x=rng.standard_normal(len(tt)); e=np.sin(np.pi*tt/0.45)**2
    # crude bandpass via moving average differences
    y=np.convolve(x,np.ones(8)/8,'same')-np.convolve(x,np.ones(64)/64,'same'); return y*e*0.5
for c in (1.8,5.2,8.0,12.6): add(sfx,whoosh(),c-0.3)
def tick():
    tt,e=env(0.06,90); return np.sin(2*np.pi*2200*tt)*e*0.35
for i in range(6): add(sfx,tick(),5.9+i*0.35)
def ding():
    tt,e=env(1.2,3); return (np.sin(2*np.pi*1318*tt)+0.5*np.sin(2*np.pi*1976*tt))*e*0.3
add(sfx,ding(),9.4)
def boom():
    tt,e=env(1.0,4); f=40+60*np.exp(-tt*10); return np.sin(2*np.pi*np.cumsum(f)/sr)*e*0.8
add(sfx,boom(),0.0)
t=np.arange(n)/sr; out*=np.minimum(1,(D-t)/0.8)
out/=np.abs(out).max()*1.3; sfx/=np.abs(sfx).max()*1.6
sf.write('musica.wav',np.stack([out,out],1),sr); sf.write('sfx.wav',np.stack([sfx,sfx],1),sr)
