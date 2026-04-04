# Plano Estratégico NonoTV Elite - Roteiro v8.0+

## 🚀 Visão Geral: A Era Dual-Environment
O projeto NonoTV Elite superou a fase de instabilidade de sintonização e consolidou sua arquitetura em dois motores independentes: **Live Stream** e **Cinema VOD**. O foco agora expande para Inteligência Artificial Generativa e Refinamento de UX para TVs 4K.

---

## 📈 Linha do Tempo e Acompanhamento

| Fase | Objetivo | Status | Versão Marco |
|:---:|:---|:---:|:---:|
| **1** | Segurança & Estabilização de Build | ✅ Concluído | v4.2 |
| **2** | Performance Massiva (Sync Worker) | ✅ Concluído | v5.0 |
| **3** | Virtualização de Grid & Fallbacks | ✅ Concluído | v6.0 |
| **4** | Arquitetura Dual-Environment (Live vs Cinema) | ✅ Concluído | v8.0 |
| **5** | AI Metadata Enrichment (Gemini PRO) | 🚧 Iniciando | v8.1 |
| **6** | Pre-flight Stitching & DAI (Resiliência Server-side) | 📅 Planejado | v8.5 |
| **7** | Sistema Multi-Perfis & Nuvem | 📅 Planejado | v9.0 |

---

## 🛠️ Status das Tasks Críticas

### ✅ Concluído (v8.0)
- **Separação de Ambientes:** `LivePlayer.jsx` e `CinemaPlayer.jsx` operando de forma estrita.
- **Detecção de DNA de Codec:** Identificação técnica de sinal via extensão de arquivo (.mp4 vs .m3u8).
- **Zapping via D-Pad:** Navegação funcional dentro do player de TV.
- **Hard Reset de Memória:** Limpeza agressiva de buffers entre trocas de canal.

### 🚧 Em Andamento (Foco Atual)
- **AI Sync Metadata:** Integrar Gemini AI para gerar sinopses e posters quando o XMLTV/EPG falhar.
- **Unified Remote API:** Melhorar listeners de controle remoto para comportamentos específicos (Seek em Cinema / Zapping em Live).

### 📅 Próximos Passos (Backlog Elite)
- **Stitcher Worker:** Mover a orquestração do Google Video Stitcher para background.
- **Auto-Quality Selector:** Switch dinâmico de bitrate baseado em rede (detectDeviceProfile).

---

## 🛡️ Regras de Ouro de Evolução
1. **NUNCA** misturar lógica de Live e Cinema em um mesmo componente.
2. **Priorizar** detecção técnica (URL) sobre metadados textuais.
3. **Validar** sintonização em JSDOM antes de qualquer deploy Android.

---
*Documento atualizado em 03/04/2026 às 20:30*
*Status: Alpha Elite v8.0 estável*
