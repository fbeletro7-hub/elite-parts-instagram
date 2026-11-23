// Paletas visuais da Elite Parts. Use "estilo" no conteudo.json para variar o visual a cada dia.
// Todas seguem a marca (azul #3D7BFF, escuro #0A0D14, claro #F2F5FA, fonte Michroma).
module.exports = {
  escuro: {
    fundo: (story) => `radial-gradient(circle at 50% ${story ? 55 : 57}%,#1d3a80 0%,#0f1d44 22%,#0A0D14 55%)`,
    texto: '#F2F5FA', destaque: '#3D7BFF', sec: '#7F8BA3', etiqueta: '#3D7BFF',
    borda: '#3D7BFF', botao: '#3D7BFF', botaoTexto: '#FFFFFF', tela: 'conic-gradient(from 200deg at 55% 58%,#2B57B8,#0f1d44,#3D7BFF,#1b3577,#2D4F9E,#0f1d44,#2B57B8)',
    corpo: '#151B29', aro: '#1c2233', grade: 'rgba(61,123,255,.08)',
  },
  claro: {
    fundo: (story) => `radial-gradient(circle at 50% ${story ? 60 : 62}%,#dbe6ff 0%,#eef2fa 35%,#F7F9FC 70%)`,
    texto: '#0A0D14', destaque: '#2459E0', sec: '#4A5568', etiqueta: '#2459E0',
    borda: '#2459E0', botao: '#0A0D14', botaoTexto: '#FFFFFF', tela: 'conic-gradient(from 200deg at 55% 58%,#3D7BFF,#9db8ff,#2459E0,#cfdcff,#3D7BFF)',
    corpo: '#0A0D14', aro: '#1c2233', grade: 'rgba(36,89,224,.07)',
  },
  azul: {
    fundo: () => 'linear-gradient(180deg,#3D7BFF 0%,#2F66E6 45%,#1b3577 100%)',
    texto: '#FFFFFF', destaque: '#0A0D14', sec: '#E3EBFF', etiqueta: '#0A0D14',
    borda: '#FFFFFF', botao: '#0A0D14', botaoTexto: '#FFFFFF', tela: 'conic-gradient(from 200deg at 55% 58%,#0A0D14,#1b3577,#0f1d44,#3D7BFF,#0A0D14)',
    corpo: '#0A0D14', aro: '#0f1d44', grade: 'rgba(255,255,255,.08)',
  },
};
