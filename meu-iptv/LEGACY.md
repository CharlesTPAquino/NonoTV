# Projeto Legado - NÃO USAR

**Status**: Legado desde 29/03/2026

## Este diretório NÃO deve ser usado para desenvolvimento

### Motivo
Este era o projeto secundário que continha mais fontes IPTV, mas foi decidido unificar tudo no projeto principal.

### Projeto Ativo
Edite o código em:
```
/home/pcnono/Secretária/IPTV/meu-iptv/
```

### Função deste diretório
- Apenas para disaster recovery
- NÃO fazer build aqui
- NÃO editar código aqui
- Manter para referência histórica

### O que foi migrado
- Fontes IPTV (35+ fontes) → `src/data/sources.js` no projeto pai
- Lógica de API com fallback → `src/services/api.js` no projeto pai

### Data de desativação
29 de Março de 2026
