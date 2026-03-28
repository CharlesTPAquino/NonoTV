# 🚀 NonoTV Android Deployment & Versioning Guide

## O que é esse processo?
Para padronizar o deploy e garantir integridade entre IDEs, o arquivo executável `deploy.sh` localizado na raiz do projeto é a **fonte oficial** para a geração e distribuição dos APKs Android neste projeto.  
Sempre que for enviar o app para seu repositório local e para o Drive, execute apenas este script em vez de compilar pelo Android Studio ou manualmente.

Ele foi automatizado para realizar:
1. **Quality Gate (Testes)**: Impede uploads de código quebrado garantindo que os testes básicos de UI e Parser M3U passem (`npm test`).
2. **Build Web**: Compilação otimizada para o padrão web (`npm run build`).
3. **Sincronização**: Bridge com os assets Nativos Android via Capacitor (`npx cap sync`).
4. **Android Build**: Inicialização do Gradle Daemon e a geração do app local (`./gradlew assembleDebug`).
5. **Automação de Histórico**: Geração de um arquivo de Latest Edition e Backup na subpasta em nuvem/local.

---

## ☁️ Automação Cloud e Versionamento

### 1. Pastas e Controle de Versão (Rollback Seguro)
A cópia de seus arquivos sempre será dividida em:
* `NonoTV_latest.apk`: Usado para instalação e atualizações mais recentes na sua Mi TV Stick/Tablet.
* `Historico/`: Uma subpasta especial com a cópia exata do seu deploy no formato `NonoTV_vYYYY-MM-DD_HH-MM.apk`. Esta estrutura assegura que se houver falhas críticas ou bugs graves na versão latest, basta acessar a pasta, baixar o APK marcado com a data anterior e reinstalá-lo para fazer o downgrade.

### 2. Integração com a Nuvem (`rclone`)
O deploy para o seu Google Drive não necessita o navegador aberto para ser executado.
* **Nome do Remote do rclone**: `gdrive`
* **ID da Pasta Alvo (Nono+)**: `1Xd5pLMdsikeEYGOTXEa0NTDzlreaseuv`

⚠️ **Atenção em Computadores Novos**:
Caso esse repositório seja clonado para um computador ou máquina virtual nova, abra um terminal e rode:
```bash
rclone config
```
E registre e autentique uma conexão nomeada de `gdrive`. O script automaticamente vai enviar arquivos da compilação direto para a pasta acima baseando-se apenas neste nome de servidor.

---

## 🛠 Como Automatizar na sua IDE atual e Futuras

### 🟦 Para Visual Studio Code / Cursor / Windsurf
Crie uma automação local de clique único!
1. Na raiz do projeto, garanta que a pasta se chama `.vscode`
2. Crie ou adicione o código abaixo no arquivo `.vscode/tasks.json`

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "🚀 Build & Deploy APK to Google Drive",
      "type": "shell",
      "command": "./deploy.sh",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": true,
        "panel": "shared",
        "clear": true
      },
      "problemMatcher": [],
      "runOptions": {
        "runOn": "default"
      }
    }
  ]
}
```

> **Para executar lá**: Você pode simplesmente apertar `Ctrl + Shift + P` no teclado, digitar **Run Task** (Executar Tarefa) e escolher o Launch "Build & Deploy APK to Google Drive", permitindo que seja rodado num click sem lembrar comandos.

### 🟩 Para WebStorm / IntelliJ / Android Studio
Nos produtos da JetBrains, vá para a seta de **Run Configurations** no topo direito da tela (onde diz Add Configuration...):
1. **+ Adicionar Nova Configuração** > Selecione **Shell Script**
2. Script path: Aponte para a localização de `"./deploy.sh"`
3. Name: `Build NonoTV & GDrive`
Assim, basta apertar o botão "Play" verde no topo da IDE e o envio automatizado vai iniciar.
