#!/usr/bin/env node

/**
 * Script de teste para verificar EPG em produção
 */

import { SOURCES } from './src/data/sources.js';
import { fetchEPG, detectEPGUrl } from './src/services/EPGService.js';

async function testEPG() {
  console.log('📺 Testando EPG em produção...\n');
  
  // Pega as primeiras fontes M3U para teste
  const testSources = SOURCES.filter(s => s.username && s.expires && s.expires >= '2026-10-01');
  
  for (const source of testSources.slice(0, 3)) {
    console.log(`📌 Testando: ${source.name}`);
    console.log(`🔗 URL: ${source.url}`);
    
    const epgInfo = detectEPGUrl(source.url);
    if (!epgInfo) {
      console.log('❌ Nenhuma URL de EPG detectada');
      console.log('');
      continue;
    }
    
    console.log(`📅 URL EPG: ${epgInfo.url}`);
    console.log(`🏷️ Tipo: ${epgInfo.type}`);
    
    try {
      const start = Date.now();
      const epgData = await fetchEPG(source.url);
      const duration = Date.now() - start;
      
      if (epgData) {
        console.log(`✅ Sucesso! ${epgData.programs.length} programas encontrados`);
        console.log(`📺 Canais com EPG: ${Object.keys(epgData.channelMap).length}`);
        console.log(`⏱️ Tempo: ${duration}ms`);
        
        if (epgData.programs.length > 0) {
          const firstProgram = epgData.programs[0];
          console.log(`🎬 Exemplo: "${firstProgram.title}" (${firstProgram.category})`);
        }
      } else {
        console.log('❌ Sem dados de EPG');
      }
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
    }
    
    console.log('---\n');
  }
  
  console.log('✅ Teste de EPG concluído');
}

testEPG().catch(console.error);