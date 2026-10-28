import sys, math, subprocess, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W,H,FPS=1080,1920,30; DUR=18.5; N=int(DUR*FPS)
P='/mnt/project-files/'
FB='/usr/share/fonts/opentype/inter/Inter-Bold.otf'; FM='/usr/share/fonts/opentype/inter/Inter-Medium.otf'; FS='/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
f=lambda p,s: ImageFont.truetype(p,s)
BLUE=(74,140,255); WHITE=(240,244,255); NAVY=(8,13,30)
def clamp(x,a=0,b=1): return max(a,min(b,x))
def ease(x): x=clamp(x); return 1-(1-x)**3
def eio(x): x=clamp(x); return x*x*(3-2*x)
def back(x):
    x=clamp(x); c=1.7; return 1+(c+1)*(x-1)**3+c*(x-1)**2

# background
yy,xx=np.mgrid[0:H,0:W]
d=np.sqrt(((xx-W/2)/W)**2+((yy-H*0.58)/H*1.2)**2)
g=np.clip(1-d*1.6,0,1)[...,None]
bg=(np.array(NAVY)*(1-g)+np.array((20,42,100))*g).astype(np.uint8)
BG=Image.fromarray(bg,'RGB')

logo=Image.open(P+'elite-parts-logo/final/elite-parts-horizontal-transparente.png').convert('RGBA')
logo=logo.resize((380,int(380*logo.height/logo.width)),Image.LANCZOS)
sym=Image.open(P+'elite-parts-logo/final/elite-parts-simbolo-transparente.png').convert('RGBA')

# display sprites
DW,DH=540,1110; R=78
def rr_mask(w,h,r,ss=3):
    m=Image.new('L',(w*ss,h*ss),0); ImageDraw.Draw(m).rounded_rectangle([0,0,w*ss-1,h*ss-1],r*ss,fill=255)
    return m.resize((w,h),Image.LANCZOS)
MASK=rr_mask(DW,DH,R)
def panel(inner):
    im=Image.new('RGBA',(DW,DH),(0,0,0,0))
    base=Image.new('RGBA',(DW,DH),(40,44,54,255)); im.paste(base,(0,0),MASK)
    b=14; inn=rr_mask(DW-2*b,DH-2*b,R-b)
    im.paste(inner.resize((DW-2*b,DH-2*b)),(b,b),inn)
    # notch island
    d=ImageDraw.Draw(im); d.rounded_rectangle([DW/2-80,40,DW/2+80,84],22,fill=(0,0,0,255))
    return im
black=Image.new('RGBA',(10,10),(6,7,10,255))
# glass with subtle reflection
gl=np.zeros((DH,DW,4),np.uint8); gl[...,3]=255
ref=np.clip(1-np.abs((np.mgrid[0:DH,0:DW][1]*1.0+np.mgrid[0:DH,0:DW][0]*0.5-500)/180),0,1)*22
gl[...,0]=6+ref; gl[...,1]=7+ref; gl[...,2]=12+ref*1.3
GLASS=panel(Image.fromarray(gl,'RGBA'))
# gold film
gy,gx=np.mgrid[0:DH,0:DW]
sh=0.5+0.5*np.sin(gx/40+gy/90)*np.cos(gy/150)
gold=np.stack([200+50*sh,160+60*sh,20+40*sh,np.full_like(sh,235)],-1).astype(np.uint8)
GOLD=Image.fromarray(gold,'RGBA')
# wallpaper
iy,ix=np.mgrid[0:DH,0:DW]; ang=(np.arctan2(iy-DH*0.62,ix-DW/2)/(2*np.pi))%1
import colorsys
hsv=np.stack([ang,np.full_like(ang,0.75),np.full_like(ang,1.0)],-1)
def hsv2rgb(h):
    i=(h[...,0]*6).astype(int)%6; fr=h[...,0]*6-np.floor(h[...,0]*6); v=h[...,2]; s=h[...,1]
    p=v*(1-s); q=v*(1-fr*s); t=v*(1-(1-fr)*s)
    r=np.choose(i,[v,q,p,p,t,v]); g_=np.choose(i,[t,v,v,q,p,p]); b_=np.choose(i,[p,p,t,v,v,q])
    return np.stack([r,g_,b_],-1)
rgb=hsv2rgb(hsv); rad=np.sqrt((ix-DW/2)**2+(iy-DH*0.62)**2)/DH
rgb=rgb*(1-np.clip(rad*0.5,0,0.4))[...,None]
WP=Image.fromarray(np.concatenate([(rgb*255).astype(np.uint8),np.full((DH,DW,1),255,np.uint8)],-1),'RGBA')
d=ImageDraw.Draw(WP); 
d.text((DW/2,150),'terça-feira, 28 de outubro',font=f(FM,30),fill=(255,255,255),anchor='mm')
d.text((DW/2,250),'10:00',font=f(FB,150),fill=(255,255,255),anchor='mm')
SCREEN=panel(WP)

teo=Image.open(P+'personagem/teo-personagem.png').convert('RGB').crop((60,60,700,900))
teo=teo.resize((int(teo.width*1.3),int(teo.height*1.3)),Image.LANCZOS)
ta=np.ones((teo.height,teo.width),np.float32)
fy=np.linspace(0,1,teo.height); ta*=np.clip(fy/0.1,0,1)[:,None]
fx=np.linspace(0,1,teo.width); ta*=np.clip(np.minimum(fx,1-fx)/0.22,0,1)[None,:]
TEO=teo.convert('RGBA'); TEO.putalpha(Image.fromarray((ta*255).astype(np.uint8)))

def caption(img,t,t0,t1,kick,l1,l2):
    a=ease((t-t0)/0.45)*(1-ease((t-(t1-0.3))/0.3))
    if a<=0: return
    lay=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(lay)
    dy=int((1-ease((t-t0)/0.45))*40); A=int(255*a)
    d.text((90,300+dy),' '.join(kick),font=f(FS,30),fill=BLUE+(A,))
    d.text((90,350+dy),l1,font=f(FB,84),fill=WHITE+(A,))
    d.text((90,450+dy),l2,font=f(FB,84),fill=BLUE+(A,))
    img.alpha_composite(lay)

def place(img,spr,cx,cy,scale=1.0,alpha=1.0,rot=0):
    s=spr
    if scale!=1.0: s=s.resize((max(1,int(s.width*scale)),max(1,int(s.height*scale))),Image.BILINEAR)
    if rot: s=s.rotate(rot,resample=Image.BICUBIC,expand=True)
    if alpha<1: 
        al=s.getchannel('A').point(lambda v:int(v*alpha)); s=s.copy(); s.putalpha(al)
    img.alpha_composite(s,(int(cx-s.width/2),int(cy-s.height/2)))

def glow(img,cx,cy,w,h,col,a):
    lay=Image.new('RGBA',(W,H),(0,0,0,0)); ImageDraw.Draw(lay).rounded_rectangle([cx-w/2,cy-h/2,cx+w/2,cy+h/2],90,fill=col+(int(a*150),))
    img.alpha_composite(lay.filter(ImageFilter.GaussianBlur(60)))

# box sprite
BW,BH=640,1240
def make_box(lidopen):
    im=Image.new('RGBA',(BW,BH),(0,0,0,0)); d=ImageDraw.Draw(im)
    d.rounded_rectangle([0,0,BW-1,BH-1],36,fill=(16,28,62,255),outline=(60,110,220,255),width=5)
    s=sym.resize((150,257),Image.LANCZOS); im.alpha_composite(s,(BW//2-75,BH//2-200))
    d.text((BW/2,BH/2+130),'E L I T E   P A R T S',font=f(FS,34),fill=WHITE,anchor='mm')
    d.text((BW/2,BH/2+185),'DISPLAY  ·  LACRADO',font=f(FM,24),fill=BLUE,anchor='mm')
    d.rectangle([BW/2-120,BH-90,BW/2+120,BH-60],fill=(220,60,60,255))
    d.text((BW/2,BH-75),'LACRE ELITE',font=f(FB,20),fill=WHITE,anchor='mm')
    return im
BOX=make_box(False)

CY=1190
def frame(t):
    img=BG.convert('RGBA')
    img.alpha_composite(logo,(W//2-logo.width//2,110))
    # S1 0-3.2 box drops
    if t<3.2:
        caption(img,t,0.1,3.2,'ATENÇÃO, TÉCNICO','Display novo','chegando?')
        y=-800+(CY+20+800)*back(t/0.9)
        glow(img,W/2,CY+20,560,1100,(50,100,255),ease(t/1))
        place(img,BOX,W/2,y,0.9)
    elif t<6.9:
        u=t-3.2
        caption(img,t,3.2,6.9,'EMBALAGEM ELITE','Lacrado e','protegido.')
        glow(img,W/2,CY,560,1100,(50,100,255),1)
        # box slides down and fades, display rises
        p=eio((u-0.4)/1.4)
        place(img,BOX,W/2,CY+20+p*900,0.9,1-eio((u-1.0)/1.2))
        sp=ease((u-0.5)/1.6)
        place(img,GLASS,W/2,CY+300-300*sp,0.92,clamp(sp*1.5))
        # bag overlay fading
        if sp>0:
            ba=0.35*(1-eio((u-2.2)/1))*clamp(sp*2)
            if ba>0:
                lay=Image.new('RGBA',(W,H),(0,0,0,0)); dd=ImageDraw.Draw(lay)
                dd.rounded_rectangle([W/2-300,CY+300-300*sp-560,W/2+300,CY+300-300*sp+560],40,fill=(200,215,240,int(255*ba)))
                img.alpha_composite(lay)
    elif t<10.6:
        u=t-6.9
        caption(img,t,6.9,10.6,'PASSO A PASSO','Tira a película','e tá perfeito.')
        glow(img,W/2,CY,560,1100,(255,190,60),0.6*(1-eio((u-2)/1.2))+0.0)
        glow(img,W/2,CY,560,1100,(50,100,255),eio((u-2)/1.2))
        sc=0.92; img_disp=GLASS.copy()
        # peel line from top to bottom
        pl=eio((u-0.6)/2.2)*(DH+160)-80
        film=Image.new('RGBA',(DW,DH),(0,0,0,0))
        fm=Image.new('L',(DW,DH),0); dm=ImageDraw.Draw(fm)
        # diagonal line: y = pl + (x-DW)*0.25
        poly=[(0,pl+0.25*(-DW)+0),(DW,pl),(DW,DH),(0,DH)]
        poly=[(0,pl-DW*0.25),(DW,pl),(DW,DH),(0,DH)]
        dm.polygon(poly,fill=210)
        fm=Image.fromarray(np.minimum(np.array(fm),np.array(MASK)))
        film.paste(GOLD,(0,0),fm)
        img_disp.alpha_composite(film)
        # curled flap
        if 0<pl<DH+60:
            dd=ImageDraw.Draw(img_disp)
            h=70
            dd.polygon([(0,pl-DW*0.25),(DW,pl),(DW,pl-h),(0,pl-DW*0.25-h*0.6)],fill=(255,230,140,200))
            dd.line([(0,pl-DW*0.25),(DW,pl)],fill=(255,250,210,255),width=4)
        img_disp.putalpha(Image.fromarray(np.minimum(np.array(img_disp.getchannel('A')),np.array(MASK))))
        place(img,img_disp,W/2,CY,sc)
        # sparkle at end
        if u>3.0:
            s=ease((u-3.0)/0.4)*(1-ease((u-3.3)/0.4))
            lay=Image.new('RGBA',(W,H),(0,0,0,0)); dd=ImageDraw.Draw(lay); cx,cy=W/2+180,CY-380; r=60*s
            dd.polygon([(cx,cy-r),(cx+r*0.2,cy-r*0.2),(cx+r,cy),(cx+r*0.2,cy+r*0.2),(cx,cy+r),(cx-r*0.2,cy+r*0.2),(cx-r,cy),(cx-r*0.2,cy-r*0.2)],fill=(255,255,255,int(255*s)))
            img.alpha_composite(lay)
    elif t<14.2:
        u=t-10.6
        caption(img,t,10.6,14.2,'QUALIDADE ELITE','Testado antes','de sair.')
        on=eio((u-0.5)/0.5)
        glow(img,W/2,CY,560,1100,(140,120,255),0.6+0.4*on)
        place(img,GLASS,W/2,CY,0.92)
        if on>0: place(img,SCREEN,W/2,CY,0.92,on)
        tags=['IMAGEM NÍTIDA','TOQUE PRECISO','LIGA DE PRIMEIRA']
        lay=Image.new('RGBA',(W,H),(0,0,0,0)); dd=ImageDraw.Draw(lay)
        for i,tg in enumerate(tags):
            a=ease((u-1.0-i*0.35)/0.4)
            if a<=0: continue
            y=CY+560+ (i//2)*0; 
            x=[W/2-250,W/2+80,W/2-90][i]; y=[CY+430,CY+430,CY+520][i]
            x=[250,610,430][i]; y=[CY+440,CY+440,CY+520][i]
            fnt=f(FS,26); tw=dd.textlength(tg,font=fnt)
            dd.rounded_rectangle([x-tw/2-24,y-26+(1-a)*20,x+tw/2+24,y+26+(1-a)*20],26,fill=(14,24,56,int(240*a)),outline=BLUE+(int(255*a),),width=3)
            dd.text((x,y+(1-a)*20),tg,font=fnt,fill=WHITE+(int(255*a),),anchor='mm')
        img.alpha_composite(lay)
    else:
        u=t-14.2
        a=ease(u/0.5)
        lay=Image.new('RGBA',(W,H),(0,0,0,0)); dd=ImageDraw.Draw(lay); A=int(255*a)
        dd.text((W/2,400),'Peça seu',font=f(FB,96),fill=WHITE+(A,),anchor='mm')
        dd.text((W/2,510),'Display Elite.',font=f(FB,96),fill=BLUE+(A,),anchor='mm')
        dd.text((W/2,610),'Pedido até as 10h, entrega no mesmo dia.',font=f(FM,34),fill=(190,200,225,A),anchor='mm')
        img.alpha_composite(lay)
        ty=H-TEO.height+60+int((1-ease((u-0.2)/0.6))*300)
        img.alpha_composite(TEO,(W//2-TEO.width//2,ty))
        b=ease((u-0.6)/0.5); pulse=1+0.04*math.sin(max(0,u-1.2)*6)
        lay=Image.new('RGBA',(W,H),(0,0,0,0)); dd=ImageDraw.Draw(lay)
        bw,bh=620*pulse,120*pulse; by=H-260
        dd.rounded_rectangle([W/2-bw/2,by-bh/2,W/2+bw/2,by+bh/2],bh/2,fill=(37,211,102,int(255*b)))
        dd.text((W/2,by),'Chame no WhatsApp',font=f(FB,int(46*pulse)),fill=(255,255,255,int(255*b)),anchor='mm')
        dd.text((W/2,H-130),'@elitepartsofc  ·  ARAPIRACA - AL',font=f(FS,32),fill=(220,228,250,int(255*b)),anchor='mm')
        img.alpha_composite(lay)
    # fade in/out
    fo=min(clamp(t/0.3),clamp((DUR-t)/0.4))
    if fo<1: img=Image.blend(Image.new('RGBA',(W,H),(0,0,0,255)),img,fo)
    return img.convert('RGB')

if len(sys.argv)>2:
    for ts in sys.argv[2:]: frame(float(ts)).save(f'{sys.argv[1]}_{ts}.png')
    sys.exit()
p=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-c:v','libx264','-crf','18','-preset','medium','-pix_fmt','yuv420p',sys.argv[1]],stdin=subprocess.PIPE)
for i in range(N): p.stdin.write(frame(i/FPS).tobytes())
p.stdin.close(); p.wait()
