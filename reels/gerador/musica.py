import numpy as np, soundfile as sf
sr=44100; D=18.5; n=int(sr*D); t=np.arange(n)/sr; out=np.zeros(n)
bpm=112; beat=60/bpm
def add(sig,start):
    i=int(start*sr); j=min(n,i+len(sig)); out[i:j]+=sig[:j-i]
def kick():
    tt=np.arange(int(0.35*sr))/sr; f=50+90*np.exp(-tt*30); return np.sin(2*np.pi*np.cumsum(f)/sr)*np.exp(-tt*9)*0.9
def hat():
    tt=np.arange(int(0.06*sr))/sr; x=np.random.randn(len(tt)); x=np.diff(np.r_[0,x]); return x*np.exp(-tt*70)*0.12
def note(fr,dur,amp,saw=False):
    tt=np.arange(int(dur*sr))/sr; env=np.minimum(1,tt/0.02)*np.exp(-tt*1.5)
    w=sum(np.sin(2*np.pi*fr*k*tt)/k for k in range(1,6)) if saw else np.sin(2*np.pi*fr*tt)
    return w*env*amp
chords=[(57,60,64),(53,57,60),(48,52,55),(55,59,62)]  # Am F C G
mf=lambda m:440*2**((m-69)/12)
b=0; tm=0.0
while tm<D-0.5:
    bar=int(b//4); ch=chords[bar%4]
    if tm>0.4: add(kick(),tm)
    add(hat(),tm+beat/2)
    if b%4==0:
        for m in ch: add(note(mf(m),beat*4,0.05,True),tm)
    add(note(mf(ch[0]-24),beat*0.9,0.25),tm)
    if b%2==1: add(note(mf(ch[2]+12),beat*0.4,0.05),tm+beat/2)
    b+=1; tm+=beat
fade=np.minimum(1,np.minimum(t/0.5,(D-t)/1.5)); out*=fade
out/=np.abs(out).max()*1.25
sf.write('musica.wav',np.stack([out,out],1),sr)
