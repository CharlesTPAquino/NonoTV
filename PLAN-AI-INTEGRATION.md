# Plano de Super-Integração de IA (NonoTV Elite)

Este plano abrange a inserção faseada das 4 funcionalidades principais baseadas no Gemini 1.5.

## 🛡️ Auditoria de Impacto (AI) - Pacote "All-in-One"

### 1. Evolução vs. Legado:
*   **M3U Organizer & EPG:** Transforma listas caóticas de qualquer provedor barato em uma experiência polida, superando guias estáticos quebrados.
*   **Smart Resume & Voz:** Substitui o controle frustrante de Box TV por comandos intuitivos e saudação contextual ("O que você estava vendo").

### 2. Custo de Recurso (Estimativas Críticas):
*   **RAM/CPU:** O maior risco. O `M3U Organizer` percorrendo 50.000+ linhas na UI travaria a TV. **Solução:** Rodar exclusivamente em um `Web Worker` de indexação. 
*   **Rede/API Limits:** A API do Gemini pode sofrer "Rate Limit" ao requerer 50k de EPGs. **Solução:** "Lazy Load Generative" (só chama a IA para os 10 cards que estiverem visíveis na tela simultaneamente - *IntersectionObserver*), mais indexação via `IndexedDB`.
*   **Armazenamento:** O cache de EPG local pode chegar a ~10-15MB. Aceitável.

### 3. Risco de Colapso (Top 3):
*   Limite de quota de API excedido (Gemini bloqueando as requisições gerando telas vazias).
*   *Memory Leak* no listener contínuo de Reconhecimento de Voz deixando set-top boxes antigas lentas.
*   Regex agressiva do `M3U Organizer` acidentalmente excluindo canais legítimos se não identificar o padrão de formatação.

### 4. Variáveis de Reversão:
*   Para cada funcionalidade usaremos **Feature Flags** (Interruptores) no arquivo `SettingsPanel` (Ex: `Ativar AI EPG`, `Navegação por Voz Ativa`). Se um aparelho engasgar, o usuário desliga e volta ao código nativo instantaneamente sem *downgrade* de versão de APK.

### 5. Conflito de Design System:
*   O Microfone será posicionado de modo não obstrutivo na `Navbar` e usará estado de Glassmorphism (Aura/Borda animada sutil indicando estado "Ouvindo...").
*   A formatação semântica limpara o texto antes de renderizar os Cards 16:9 e 2:3, mantendo a proporção.

---

## 🗺️ Fases de Desenvolvimento

*   **Fase 1:** M3U Smart Organizer (Filtro Zero-Lixo via Worker) e "Smart Resume" (Armazenamento de Histórico Local). Custo zero de API, alto ganho de UI.
*   **Fase 2:** Integração do Web Speech API com Gemini no *Navbar* para criar a Busca por Voz/Comandos Reais.
*   **Fase 3:** Refatoração fina do `AIRecommendations` (Já existente) com Lazy Loading das Geração de Metadados, criando o EPG Inteligente a quente.
