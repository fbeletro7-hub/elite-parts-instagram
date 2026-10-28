import sys, math, subprocess, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W,H,FPS=1080,1920,30; DUR=16.6; N=int(DUR*FPS)
P='/mnt/project-files/'; HERE=sys.path[0]+'/'
MI=HERE+'Michroma.ttf'; FB='/usr/share/fonts/opentype/inter/Inter-Bold.otf'; FS='/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'; FM='/usr/share/fonts/opentype/inter/Inter-Medium.otf'
f=lambda p,s: ImageFont.truetype(p,s)
BLUE=(61,123,255); WHITE=(242,245,250); GRAY=(127,139,163); BGC=(10,13,20)
clamp=lambda x,a=0,b=1: max(a,min(b,x))
def ease(x): x=clamp(x); return 1-(1-x)**3
def eio(x): x=clamp(x); return x*x*(3-2*x)
def back(x): x=clamp(x); c=1.7; return 1+(c+1)*(x-1)**3+c*(x-1)**2

yy,xx=np.mgrid[0:H,0:W]
d=np.sqrt(((xx-W/2)/W)**2+((yy-H*0.55)/H*1.2)**2); g=np.clip(1-d*1.7,0,1)[...,None]
BG=Image.fromarray((np.array(BGC)*(1-g)+np.array((18,36,92))*g).astype(np.uint8)).convert('RGBA')
logo=Image.open(P+'elite-parts-logo/final/elite-parts-horizontal-transparente.png').convert('RGBA')
logo=logo.resize((340,int(340*logo.height/logo.width)),Image.LANCZOS)

def rr_mask(w,h,r,ss=3):
    m=Image.new('L',(w*ss,h*ss),0); ImageDraw.Draw(m).rounded_rectangle([0,0,w*ss-1,h*ss-1],r*ss,fill=255)
    return m.resize((w,h),Image.LANCZOS)
def hsv2rgb(h,s,v):
    i=(h*6).astype(int)%6; fr=h*6-np.floor(h*6); p=v*(1-s); q=v*(1-fr*s); t=v*(1-(1-fr)*s)
    return np.stack([np.choose(i,[v,q,p,p,t,v]),np.choose(i,[t,v,v,q,p,p]),np.choose(i,[p,p,t,v,v,q])],-1)
def wallpaper(w,h,sat=0.85,val=1.0,stripes=False):
    iy,ix=np.mgrid[0:h,0:w]
    if stripes: hue=((iy/h*1.4+ix/w*0.3))%1
    else: hue=(np.arctan2(iy-h*0.62,ix-w/2)/(2*np.pi))%1
    rgb=hsv2rgb(hue,np.full_like(hue,sat,dtype=float),np.full_like(hue,val,dtype=float))
    return Image.fromarray((rgb*255).astype(np.uint8)).convert('RGBA')

# flexible bare panel
PW,PH=600,1240
def soft_panel():
    im=Image.new('RGBA',(PW,PH+90),(0,0,0,0))
    pan=Image.new('RGBA',(PW,PH),(10,10,12,255))
    wp=wallpaper(PW-16,PH-16,stripes=True); pan.paste(wp,(8,8),rr_mask(PW-16,PH-16,64))
    d=ImageDraw.Draw(pan); d.rounded_rectangle([PW/2-85,36,PW/2+85,82],23,fill=(0,0,0,255))
    im.paste(pan,(0,0),rr_mask(PW,PH,72))
    d=ImageDraw.Draw(im); d.rectangle([PW/2-110,PH-4,PW/2+110,PH+80],fill=(196,128,40,255)); d.rectangle([PW/2-60,PH+30,PW/2+60,PH+70],fill=(30,30,34,255))
    return im
SOFT=soft_panel(); SA=np.array(SOFT).astype(np.float32)

def bend(R,spec_phase=0.0):
    """curl top and bottom away from viewer around horizontal center axis"""
    h,w=SA.shape[:2]; cy=h*0.48; Fz=1500.0
    s=np.linspace(-cy,h-cy,h*2)
    a=s/R if R<1e8 else s*0
    a=np.clip(a,-1.45,1.45)
    yo=R*np.sin(a) if R<1e8 else s; z=R*(1-np.cos(a)) if R<1e8 else s*0
    p=Fz/(Fz+z); yo=yo*p
    OH=int(np.ceil(yo.max()-yo.min()))+2; y0=yo.min()
    oy=np.arange(OH)+y0
    sidx=np.interp(oy,yo,s)+cy; pp=np.interp(oy,yo,p); aa=np.interp(oy,yo,a)
    valid=(oy>=yo.min())&(oy<=yo.max())
    ox=np.arange(w)-w/2
    sx=ox[None,:]/pp[:,None]+w/2
    sy=np.repeat(sidx[:,None],w,1)
    ok=valid[:,None]&(sx>=0)&(sx<w-1)&(sy>=0)&(sy<h-1)
    sxi=np.clip(sx.astype(int),0,w-1); syi=np.clip(sy.astype(int),0,h-1)
    out=SA[syi,sxi].copy(); out[~ok]=0
    shade=0.5+0.5*np.cos(aa)
    spec=0.55*np.exp(-((aa-spec_phase)/0.12)**2)
    out[...,:3]=np.clip(out[...,:3]*shade[:,None,None]+255*spec[:,None,None],0,255)
    return Image.fromarray(out.astype(np.uint8),'RGBA')

# framed phones for quiz
FW,FH=400,820
def framed(inner,border=12):
    im=Image.new('RGBA',(FW,FH),(0,0,0,0)); im.paste(Image.new('RGBA',(FW,FH),(44,48,58,255)),(0,0),rr_mask(FW,FH,64))
    b=border; iw,ih=FW-2*b,FH-2*b; im.paste(inner.resize((iw,ih)),(b,b),rr_mask(iw,ih,64-b))
    ImageDraw.Draw(im).rounded_rectangle([FW/2-58,30,FW/2+58,62],16,fill=(0,0,0,255)); return im
def clock(img):
    d=ImageDraw.Draw(img); w,h=img.size
    d.text((w/2,120),'10:00',font=f(FB,110),fill=(255,255,255),anchor='mm'); return img
WP1=clock(wallpaper(FW,FH,0.55,0.86)); WP2=clock(wallpaper(FW,FH,0.9,1.0))
PH1=framed(WP1,22); PH2=framed(WP2,12)
blk1=Image.new('RGBA',(FW,FH),(34,36,44,255)); g1=np.array(blk1).astype(float)
# backlight bleed on incell
by,bx=np.mgrid[0:FH,0:FW]; bleed=np.exp(-((by-FH)/220)**2)*24+np.exp(-((bx)/90)**2)*10+np.exp(-((FW-bx)/90)**2)*10
g1[...,:3]+=bleed[...,None]; BLK1=framed(Image.fromarray(np.clip(g1,0,255).astype(np.uint8)),22)
BLK2=framed(Image.new('RGBA',(FW,FH),(0,0,0,255)),12)

teo=Image.open(P+'personagem/teo-personagem.png').convert('RGB').crop((60,60,700,900))
teo=teo.resize((int(teo.width*1.2),int(teo.height*1.2)),Image.LANCZOS)
ta=np.ones((teo.height,teo.width),np.float32)
fy=np.linspace(0,1,teo.height); ta*=np.clip(fy/0.1,0,1)[:,None]
fx=np.linspace(0,1,teo.width); ta*=np.clip(np.minimum(fx,1-fx)/0.22,0,1)[None,:]
TEO=teo.convert('RGBA'); TEO.putalpha(Image.fromarray((ta*255).astype(np.uint8)))

def place(img,spr,cx,cy,scale=1.0,alpha=1.0,rot=0):
    s=spr
    if scale!=1.0: s=s.resize((max(1,int(s.width*scale)),max(1,int(s.height*scale))),Image.BILINEAR)
    if rot: s=s.rotate(rot,resample=Image.BICUBIC,expand=True)
    if alpha<1: s=s.copy(); s.putalpha(s.getchannel('A').point(lambda v:int(v*alpha)))
    img.alpha_composite(s,(int(cx-s.width/2),int(cy-s.height/2)))
def glow(img,cx,cy,w,h,col,a,blur=70):
    if a<=0: return
    lay=Image.new('RGBA',(W//4,H//4),(0,0,0,0)); ImageDraw.Draw(lay).rounded_rectangle([(cx-w/2)/4,(cy-h/2)/4,(cx+w/2)/4,(cy+h/2)/4],20,fill=col+(int(a*170),))
    img.alpha_composite(lay.filter(ImageFilter.GaussianBlur(blur/4)).resize((W,H),Image.BILINEAR))
def title(img,t,t0,lines,y=300,size=70,center=True,font=MI,pop=True):
    a=ease((t-t0)/0.25)
    if a<=0: return
    lay=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(lay)
    sc=(0.6+0.4*back((t-t0)/0.35)) if pop else 1
    fnt=f(font,int(size*sc))
    for i,(txt,col) in enumerate(lines):
        d.text((W/2,y+i*size*1.3),txt,font=fnt,fill=col+(int(255*a),),anchor='mm',stroke_width=0)
    img.alpha_composite(lay)
def pill(d,x,y,txt,col,fill,a,size=30,font=None):
    fnt=f(font or FB,size); tw=d.textlength(txt,font=fnt)
    d.rounded_rectangle([x-tw/2-30,y-size,x+tw/2+30,y+size],size,fill=fill+(int(230*a),),outline=col+(int(255*a),),width=4)
    d.text((x,y),txt,font=fnt,fill=WHITE+(int(255*a),),anchor='mm')

def frame(t):
    img=BG.copy()
    shake=(0,0)
    if t<6.0 and t<5.2:
        # bending panel scenes A+B
        cyc=t*1.6
        k=0.5-0.5*math.cos(cyc*math.pi)  # 0..1 flex
        R=2600-2250*k
        spr=bend(R,spec_phase=math.sin(t*2.2)*0.9)
        rot=math.sin(t*1.3)*6
        sc=0.92+0.06*ease(t/0.4)
        if t<0.15: sc*=1.15-t
        glow(img,W/2,1180,620,1000,(150,90,255),0.55+0.25*k)
        place(img,spr,W/2,1180,sc,1,rot)
        img.alpha_composite(logo,(W//2-logo.width//2,110))
        if t<1.8:
            title(img,t,0.0,[('ESSA TELA',WHITE),('DOBRA.',BLUE)],y=330,size=86)
        else:
            title(img,t,1.8,[('SOFT OLED',BLUE)],y=310,size=84)
            title(img,t,2.6,[('Preto de verdade. Cor viva.',WHITE)],y=420,size=44,font=FB,pop=False)
    elif t<12.6:
        img.alpha_composite(logo,(W//2-logo.width//2,110))
        u=t-5.2
        ent=back(u/0.5)
        x1=W/2-215; x2=W/2+215; cy=1100
        black=eio((t-8.1)/0.35)
        glow(img,x1,cy,380,780,(80,120,255),0.5*(1-black))
        glow(img,x2,cy,380,780,(80,120,255),0.5*(1-black))
        for i,(ph,bk,x) in enumerate([(PH1,BLK1,x1),(PH2,BLK2,x2)]):
            place(img,ph,x,cy+(1-ent)*900,1.0)
            if black>0: place(img,bk,x,cy,1.0,black)
        lay=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(lay)
        for i,x in enumerate([x1,x2]):
            a=ease((u-0.3)/0.3)
            d.ellipse([x-48,cy-470-48,x+48,cy-470+48],fill=BLUE+(int(255*a),)); d.text((x,cy-470),str(i+1),font=f(MI,48),fill=WHITE+(int(255*a),),anchor='mm')
        img.alpha_composite(lay)
        if t<8.0:
            title(img,t,5.2,[('INCELL',WHITE),('OU OLED?',BLUE)],y=290,size=78)
            # countdown chip
            lay=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(lay)
            a=ease((u-0.8)/0.3)
            pill(d,W/2,1640,'COMENTA 1 OU 2',BLUE,(14,24,56),a,36,MI)
            img.alpha_composite(lay)
        elif t<9.4:
            title(img,t,8.0,[('TESTE',WHITE),('DO PRETO',BLUE)],y=290,size=78)
        else:
            title(img,t,9.4,[('O 2 É',WHITE),('OLED.',BLUE)],y=290,size=86)
            lay=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(lay)
            a=ease((t-9.6)/0.3); b=ease((t-10.0)/0.3)
            pill(d,x1,1590,'INCELL',(150,160,180),(30,34,44),a,32)
            pill(d,x2,1590,'OLED',(37,211,102),(10,60,30),b,32)
            d.text((W/2,1720),'No OLED o pixel apaga. No Incell a luz de fundo aparece.',font=f(FM,30),fill=(200,208,228,int(255*b)),anchor='mm')
            img.alpha_composite(lay)
            # ring highlight on phone 2
            if b>0:
                lay=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(lay)
                d.rounded_rectangle([x2-FW/2-14,cy-FH/2-14,x2+FW/2+14,cy+FH/2+14],76,outline=(37,211,102,int(255*b)),width=8)
                img.alpha_composite(lay)
    else:
        u=t-12.6; a=ease(u/0.3)
        img.alpha_composite(logo,(W//2-logo.width//2,110))
        spr=bend(1400-300*math.sin(u*2),math.sin(u*2)*0.8)
        glow(img,W/2,820,420,600,(150,90,255),0.5*a)
        place(img,spr,W/2,830,0.5*(0.7+0.3*back(u/0.5)),a,math.sin(u*1.5)*8)
        title(img,t,12.6,[('DISPLAY OLED',WHITE),('PARA IPHONE',BLUE)],y=290,size=66)
        ty=H-TEO.height+90+int((1-ease((u-0.3)/0.5))*400)
        img.alpha_composite(TEO,(W//2-TEO.width//2,ty))
        b=ease((u-0.6)/0.4); pulse=1+0.05*math.sin(max(0,u-1)*7)
        lay=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(lay)
        bw,bh=640*pulse,124*pulse; by=H-300
        d.rounded_rectangle([W/2-bw/2,by-bh/2,W/2+bw/2,by+bh/2],bh/2,fill=(37,211,102,int(255*b)))
        d.text((W/2,by),'Chame no WhatsApp',font=f(FB,int(48*pulse)),fill=(255,255,255,int(255*b)),anchor='mm')
        d.text((W/2,H-175),'@elitepartsofc  ·  link na bio',font=f(FS,32),fill=(220,228,250,int(255*b)),anchor='mm')
        img.alpha_composite(lay)
    # flash on cuts
    for c in (1.8,5.2,8.0,9.4,12.6):
        if 0<=t-c<0.12:
            img=Image.blend(img,Image.new('RGBA',(W,H),(255,255,255,255)),0.35*(1-(t-c)/0.12))
    return img.convert('RGB')

if len(sys.argv)>2:
    for ts in sys.argv[2:]: frame(float(ts)).save(f'{sys.argv[1]}_{ts}.png')
    sys.exit()
p=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-c:v','libx264','-crf','18','-preset','medium','-pix_fmt','yuv420p',sys.argv[1]],stdin=subprocess.PIPE)
for i in range(N): p.stdin.write(frame(i/FPS).tobytes())
p.stdin.close(); p.wait()
