# 🎬 NonoTV Elite - Release Notes v4.2

Esta versão foca em **Experiência Cinematográfica**, **Performance de Rede** e **Estabilidade de Sinal**. 

---

## 🚀 1. Motor de Reprodução (Ultra-Low Latency)
O coração do player foi recalibrado para dispositivos de baixo hardware (Android TV/TV Box):
- **Buffer Inteligente**: Reduzido para **10 segundos** (evita delay acumulado) e `backBuffer` zerado para liberar memória RAM.
- **Low Latency Mode**: Ativado para garantir que o sinal ao vivo seja o mais próximo possível do real time.
- **Auto-Repair Agressivo**: Aumentamos as tentativas de reconexão para **15 vezes** com intervalo de 1s.

## 🛡️ 2. Proxy Local Blindado (`proxy-local.cjs`)
O túnel de rede agora é capaz de furar bloqueios de operadoras:
- **Suporte a Redirecionamento**: Segue automaticamente saltos de CDN (ex: servidores que redirecionam para IPs de segurança).
- **Timeout Estendido**: 120 segundos para carregar listas M3U pesadas sem erro.
- **VLC Spoofing**: Cabeçalhos que simulam perfeitamente o player VLC oficial, evitando bloqueios por "User-Agent".

## 🎨 3. UI/UX "Cinema Premium"
A interface foi redesenhada seguindo os padrões Netflix/Disney+:
- **Player Poster Mode**: Filmes e Séries agora usam o formato de **Poster Vertical (2/3)**, com gradientes dinâmicos baseados no nome do título.
- **Badges de Elite**: Identificação automática de qualidade (`4K`, `FHD`, `HD`) e tipo de conteúdo (`LIVE`, `SÉRIE`, `FILME`).
- **Navegação Lateral**: Novo menu de troca rápida de canais dentro do player (tecla **Enter** ou botão de lista).
- **Controles Glassmorphism**: Botões **2x maiores** para facilitar o uso com controle remoto.

## 🌐 4. Conectividade e DNS
- **Bypass de DNS**: URLs agora utilizam o **IP Direto (185.66.90.170)**, contornando bloqueios de DNS de provedores brasileiros (Vivo, Claro, etc).
- **Auto-Select**: O sistema agora limpa fontes inválidas e seleciona automaticamente o melhor sinal Premium disponível se a fonte salva falhar.

---

### 🛠️ Comandos Úteis (Versão 4.2)
- **Iniciar em DEV**: `node proxy-local.cjs & npm run dev`
- **Build de Produção**: `npm run build`
- **Porta do Proxy**: `3131`

---
*Assinado: Antigravity AI Engine v4.2*
