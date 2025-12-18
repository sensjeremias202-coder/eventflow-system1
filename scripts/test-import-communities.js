const fs = require('fs');
const path = require('path');

function loadSample(p){ return JSON.parse(fs.readFileSync(p,'utf8')); }

(async function(){
  const samplePath = path.join(__dirname, 'test-data','communities-sample.json');
  const raw = loadSample(samplePath);
  const imported = Array.isArray(raw) ? raw : (raw.communities && Array.isArray(raw.communities) ? raw.communities : null);
  if (!imported){ console.error('Arquivo de exemplo com formato inválido'); process.exit(2); }

  // Simulate existing localStorage communities
  const local = [
    {
      id: 'comm_abc123',
      name: 'Comunidade Central (local)',
      desc: 'Versão local existente',
      createdAt: 1712800000000,
      creatorId: '1',
      members: { '1': { role: 'admin', joinedAt: 1712800000000 } }
    },
    {
      id: 'comm_old',
      name: 'Comunidade Velha',
      desc: 'Registro antigo',
      createdAt: 1712000000000,
      creatorId: '2',
      members: {}
    }
  ];

  const map = {};
  local.forEach(c=>{ if(c && c.id) map[c.id]=c; });
  let added=0, skipped=0, conflicts=0;
  imported.forEach(ic=>{
    if (!ic || !ic.id || !ic.name){ skipped++; return; }
    const existing = map[ic.id];
    if (!existing){
      map[ic.id] = { id: ic.id, name: ic.name, desc: ic.desc||'', createdAt: ic.createdAt||Date.now(), creatorId: ic.creatorId||null, members: ic.members||{} };
      added++;
    } else {
      if (existing.name !== ic.name){
        const newId = ic.id + '_imp_' + Date.now().toString(36);
        map[newId] = { id: newId, name: ic.name, desc: ic.desc||'', createdAt: ic.createdAt||Date.now(), creatorId: ic.creatorId||null, members: ic.members||{} };
        conflicts++;
      } else {
        const merged = Object.assign({}, existing);
        merged.desc = merged.desc || ic.desc || '';
        merged.createdAt = merged.createdAt || ic.createdAt || Date.now();
        merged.creatorId = merged.creatorId || ic.creatorId || merged.creatorId;
        merged.members = Object.assign({}, ic.members || {}, existing.members || {});
        map[ic.id] = merged;
      }
    }
  });

  const merged = Object.values(map);
  console.log('Estatísticas:');
  console.log('  importadas adicionadas:', added);
  console.log('  conflitos preservados (novo id criado):', conflicts);
  console.log('  ignoradas:', skipped);
  console.log('\nResultado merged (preview):');
  console.log(JSON.stringify(merged, null, 2));

  // Optionally write out to a file for inspection
  const outPath = path.join(__dirname, 'test-data','communities-merged-output.json');
  fs.writeFileSync(outPath, JSON.stringify(merged, null, 2), 'utf8');
  console.log('\nMerged salvo em:', outPath);
})();
