/**
 * NonoTV — Web Worker de Filtragem de Alta Performance
 * Executa filtros O(N) e agrupamentos fora da Main Thread da UI
 */

self.onmessage = function(e) {
  const { channels, search, activeCategory, activeGroup } = e.data;
  
  if (!channels || !Array.isArray(channels) || channels.length === 0) {
    self.postMessage({ filtered: [], groups: [{ name: 'Todos', id: 'All' }] });
    return;
  }

  const normalizedSearch = (search || '').toLowerCase().trim();
  const isFiltered = normalizedSearch.length > 0;
  const isGroupFiltered = activeGroup && activeGroup !== 'All';
  
  const filtered = [];
  const uniqueGroups = new Set();
  
  for (let i = 0; i < channels.length; i++) {
    const c = channels[i];
    if (!c || !c.name) continue;
    
    const cType = (c.type || 'live').toLowerCase();
    if (activeCategory !== 'All' && cType !== activeCategory) continue;
    
    const cGroup = c.group || 'Geral';
    if (/adulto|sexo|hot|xxx|18\+|porno/i.test(cGroup)) continue;
    
    if (isGroupFiltered && cGroup !== activeGroup) continue;
    
    if (isFiltered) {
      if (!c.name.toLowerCase().includes(normalizedSearch) && !cGroup.toLowerCase().includes(normalizedSearch)) {
        continue;
      }
    }
    
    filtered.push(c);
    if (cGroup) uniqueGroups.add(cGroup);
  }

  const groups = [{ name: 'Todos', id: 'All' }];
  for (const g of uniqueGroups) {
    groups.push({ name: g, id: g });
  }

  self.postMessage({ filtered, groups });
};
