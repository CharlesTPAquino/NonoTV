
## 📑 Registro de Contexto (Estado em 15/04/2026)
- **Status do Projeto**: O app está estável, login funcional via  (consulta ao ), layout estável em full-screen (sem cortes).
- **Lição Aprendida**: O erro de 'undefined length' foi causado por uma *Race Condition* entre a montagem do  e a renderização da . A solução foi a barreira .
- **Arquitetura Atual**: Versão estável (09/04) + motor de Workers (Off-Main-Thread).
- **Próximos Passos Sugeridos**: 
    1. Não alterar a UI sem antes criar um componente de teste isolado.
    2. Usar o  antes de qualquer commit.
    3. Tratar a otimização de performance (HLS splitting) como uma tarefa separada do Login.
