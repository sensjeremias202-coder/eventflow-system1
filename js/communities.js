(function(){
  const ONLINE_SYNC = localStorage.getItem('ONLINE_SYNC') === 'true';
  const cfg = window.FIREBASE_CONFIG || null;
  let db = null;
  try {
    if (ONLINE_SYNC && cfg && window.firebase){
      if (!firebase.apps.length) firebase.initializeApp(cfg);
      db = firebase.database();
    }
  } catch(e){ console.warn('Firebase init in communities.js:', e); }

  const el = (id)=>document.getElementById(id);
  function show(id){ const m = el(id); if (m) m.style.display='block'; }
  function hide(id){ const m = el(id); if (m) m.style.display='none'; }

  function setActiveCommunityLabel(){
    const cid = localStorage.getItem('activeCommunityId');
    const label = el('activeCommunityLabel');
    if (label){
      if (cid){
        const list = JSON.parse(localStorage.getItem('communities')||'[]');
        const comm = list.find(c=>c.id===cid);
        const name = comm ? comm.name : cid;
        label.textContent = `Comunidade ativa: ${name} (${cid})`;
        const pub = el('publicCommunityLabel');
        if (pub) pub.textContent = `Ativo: ${name}`;
        const title = el('publicEventsTitle');
        if (title) title.textContent = `Próximos eventos — ${name}`;
      } else {
        label.textContent = '';
        const pub = el('publicCommunityLabel');
        if (pub) pub.textContent = '';
        const title = el('publicEventsTitle');
        if (title) title.textContent = 'Próximos eventos';
      }
    }
    const guard = el('headerCommunityGuard');
    if (guard){ guard.style.display = cid ? 'none' : 'inline-flex'; }
  }

  async function createCommunity(name, desc){
    const id = `comm_${Date.now().toString(36)}`;
    const creator = JSON.parse(localStorage.getItem('currentUser')||'null');
    const record = {
      id,
      name: name || 'Comunidade',
      desc: desc || '',
      createdAt: Date.now(),
      creatorId: creator?.id || null,
      members: creator?.id ? { [creator.id]: { role:'admin', joinedAt: Date.now() } } : {},
    };
    // Persist online if available, else local only
    if (db){
      await db.ref(`communities/${id}`).set(record);
    }
    // Save locally
    const all = JSON.parse(localStorage.getItem('communities')||'[]');
    all.push(record);
    localStorage.setItem('communities', JSON.stringify(all));
    localStorage.setItem('activeCommunityId', id);
    // store name for quick access
    localStorage.setItem('activeCommunityName', record.name || '');
    window.dispatchEvent(new CustomEvent('community:changed', { detail: { id } }));
    setActiveCommunityLabel();
    return id;
  }

  async function joinCommunity(id){
    const user = JSON.parse(localStorage.getItem('currentUser')||'null');
    if (!id) throw new Error('ID da comunidade é obrigatório');
    if (db){
      // Mark pending membership; admin can approve later
      await db.ref(`communities/${id}/pending/${user?.id||'anonymous'}`).set({ requestedAt: Date.now(), email: user?.email||null });
    }
    localStorage.setItem('activeCommunityId', id);
    // update name cache if available
    const all = JSON.parse(localStorage.getItem('communities')||'[]');
    const comm = all.find(c=>c.id===id);
    if (comm) localStorage.setItem('activeCommunityName', comm.name||'');
    window.dispatchEvent(new CustomEvent('community:changed', { detail: { id } }));
    setActiveCommunityLabel();
    return true;
  }

  function wireUi(){
    const cBtn = el('createCommunityBtn');
    const jBtn = el('joinCommunityBtn');
    const quickSwitch = el('quickSwitchCommunityBtn');
    const confirmCreate = el('confirmCreateCommunity');
    const confirmJoin = el('confirmJoinCommunity');

    if (cBtn){ cBtn.onclick = ()=> show('createCommunityModal'); }
    if (jBtn){ jBtn.onclick = ()=> show('joinCommunityModal'); }
    if (quickSwitch){ quickSwitch.onclick = ()=> show('joinCommunityModal'); }
    if (confirmCreate){
      confirmCreate.onclick = async ()=>{
        const name = (el('communityNameInput')?.value||'').trim();
        const desc = (el('communityDescInput')?.value||'').trim();
        el('createCommunityFeedback').textContent = 'Criando...';
        try {
          const id = await createCommunity(name, desc);
          el('createCommunityFeedback').textContent = `Comunidade criada! ID: ${id}`;
          setTimeout(()=> hide('createCommunityModal'), 800);
        } catch(e){
          el('createCommunityFeedback').textContent = `Erro: ${e.message||e}`;
        }
      };
    }
    if (confirmJoin){
      confirmJoin.onclick = async ()=>{
        const id = (el('communityIdInput')?.value||'').trim();
        el('joinCommunityFeedback').textContent = 'Solicitando entrada...';
        try {
          await joinCommunity(id);
          el('joinCommunityFeedback').textContent = 'Solicitação enviada! Aguarde aprovação.';
          setTimeout(()=> hide('joinCommunityModal'), 800);
        } catch(e){
          el('joinCommunityFeedback').textContent = `Erro: ${e.message||e}`;
        }
      };
    }
    setActiveCommunityLabel();
    // Import / show local communities UI
    const showLocalBtn = el('showLocalCommunitiesBtn');
    const importBtn = el('importCommunitiesBtn');
    const importInput = el('importCommunitiesInput');
    const localListContainer = el('localCommunitiesList');
    function refreshCommunitySelects(){
      const selects = [el('communitySelect'), el('loginCommunitySelect')];
      const list = window.communities.listLocal();
      selects.forEach(s=>{
        if (!s) return;
        const prev = s.value;
        s.innerHTML = '';
        const optPlaceholder = document.createElement('option'); optPlaceholder.value=''; optPlaceholder.textContent='Selecione...'; s.appendChild(optPlaceholder);
        list.forEach(c=>{ const opt=document.createElement('option'); opt.value=c.id; opt.textContent=`${c.name} (${c.id})`; if(c.id===prev) opt.selected=true; s.appendChild(opt); });
      });
    }
    function displayLocalCommunities(){
      if (!localListContainer) return;
      const list = window.communities.listLocal();
      if (!list.length){ localListContainer.style.display='block'; localListContainer.innerHTML='<p style="color:var(--gray);">Nenhuma comunidade local encontrada.</p>'; return; }
      const html = list.map(c=>`<div style="padding:8px;border:1px solid #eee;border-radius:6px;margin-bottom:6px;"><strong>${c.name}</strong> <small style="color:#666">(${c.id})</small><div style="font-size:0.9rem;color:#444;margin-top:6px;">${c.desc||''}</div></div>`).join('');
      localListContainer.style.display='block'; localListContainer.innerHTML = html;
    }
    if (showLocalBtn){ showLocalBtn.addEventListener('click', (e)=>{ e.preventDefault(); displayLocalCommunities(); }); }
    if (importBtn && importInput){ importBtn.addEventListener('click', (e)=>{ e.preventDefault(); importInput.click(); }); }
    if (importInput){ importInput.addEventListener('change', function(evt){
      const file = evt.target.files && evt.target.files[0]; if (!file) return;
      // Basic size guard (5MB)
      if (file.size > 5 * 1024 * 1024){ const fb = el('communitySwitchFeedback'); if (fb) fb.textContent = 'Arquivo muito grande (máx 5MB).'; setTimeout(()=>{ if (fb) fb.textContent=''; }, 3000); return; }
      const reader = new FileReader(); reader.onload = function(){
        try{
          const parsed = JSON.parse(reader.result);
          const imported = Array.isArray(parsed) ? parsed : (parsed.communities && Array.isArray(parsed.communities) ? parsed.communities : null);
          if (!imported) throw new Error('Formato inválido. Envie um array de comunidades ou um objeto { communities: [...] }');
          const local = JSON.parse(localStorage.getItem('communities')||'[]');
          const map = {};
          local.forEach(c=>{ if(c && c.id) map[c.id]=c; });
          // Stats and tracking
          let added=0, skipped=0, conflicts=0;
          const addedNames = [];
          const conflictNames = [];
          let firstAddedId = null;
          imported.forEach(ic=>{
            if (!ic || !ic.id || !ic.name){ skipped++; return; }
            const existing = map[ic.id];
            if (!existing){
              // normalize minimal fields
              map[ic.id] = { id: ic.id, name: ic.name, desc: ic.desc||'', createdAt: ic.createdAt||Date.now(), creatorId: ic.creatorId||null, members: ic.members||{} };
              added++;
              addedNames.push(ic.name);
              if (!firstAddedId) firstAddedId = ic.id;
            } else {
              // Conflict: same id exists locally
              if (existing.name !== ic.name){
                // create new id for imported community to preserve both
                const newId = ic.id + '_imp_' + Date.now().toString(36);
                map[newId] = { id: newId, name: ic.name, desc: ic.desc||'', createdAt: ic.createdAt||Date.now(), creatorId: ic.creatorId||null, members: ic.members||{} };
                conflicts++;
                conflictNames.push(ic.name);
                if (!firstAddedId) firstAddedId = newId;
              } else {
                // Same id & name: merge non-destructive fields (members merge)
                const merged = Object.assign({}, existing);
                merged.desc = merged.desc || ic.desc || '';
                merged.createdAt = merged.createdAt || ic.createdAt || Date.now();
                merged.creatorId = merged.creatorId || ic.creatorId || merged.creatorId;
                merged.members = Object.assign({}, ic.members || {}, existing.members || {});
                map[ic.id] = merged;
                // treat as updated but not added
              }
            }
          });
          const merged = Object.values(map);
          localStorage.setItem('communities', JSON.stringify(merged));
          // refresh selects and UI
          refreshCommunitySelects();
          displayLocalCommunities();
          // Clear file input so user can re-import same file if needed
          try{ importInput.value = ''; }catch(_){}
          // If no active community, select first added
          const active = localStorage.getItem('activeCommunityId');
          if (!active && firstAddedId){
            localStorage.setItem('activeCommunityId', firstAddedId);
            const comm = map[firstAddedId]; if (comm) localStorage.setItem('activeCommunityName', comm.name||'');
            window.dispatchEvent(new CustomEvent('community:changed', { detail: { id: firstAddedId } }));
            setActiveCommunityLabel();
          }
          const fb = el('communitySwitchFeedback');
          if (fb){
            const parts = [];
            if (added) parts.push(`Adicionadas: ${added} (${addedNames.join(', ')})`);
            if (conflicts) parts.push(`Conflitos preservados: ${conflicts} (${conflictNames.join(', ')})`);
            if (skipped) parts.push(`Ignoradas: ${skipped}`);
            fb.textContent = 'Importação concluída.' + (parts.length ? ' ' + parts.join(' — ') : '');
            setTimeout(()=>{ if (fb) fb.textContent=''; }, 5000);
          }
        }catch(err){ const fb = el('communitySwitchFeedback'); if (fb) fb.textContent = 'Erro ao importar: '+(err.message||err); setTimeout(()=>{ if (fb) fb.textContent=''; }, 4000); }
      };
      reader.readAsText(file);
    }); }
  }

  // Expose helpers for sync namespace usage
  window.communities = {
    getActiveId: ()=> localStorage.getItem('activeCommunityId') || null,
    listLocal: ()=> JSON.parse(localStorage.getItem('communities')||'[]'),
    switchTo: function(id){
      if (!id) return false;
      localStorage.setItem('activeCommunityId', id);
      const all = JSON.parse(localStorage.getItem('communities')||'[]');
      const comm = all.find(c=>c.id===id);
      if (comm) localStorage.setItem('activeCommunityName', comm.name||'');
      window.dispatchEvent(new CustomEvent('community:changed', { detail: { id } }));
      setActiveCommunityLabel();
      return true;
    },
    getActiveName: function(){
      return localStorage.getItem('activeCommunityName') || null;
    },
    fetchPending: async function(id){
      if (!db || !id) return {};
      const snap = await db.ref(`communities/${id}/pending`).get();
      return snap.val() || {};
    },
    approveMember: async function(id, userId){
      if (!db || !id || !userId) return false;
      const now = Date.now();
      await db.ref(`communities/${id}/members/${userId}`).set({ role:'user', joinedAt: now });
      await db.ref(`communities/${id}/pending/${userId}`).remove();
      return true;
    }
  };

  document.addEventListener('DOMContentLoaded', function(){
    wireUi();
    // Populate communitySelect in profile if present
    const select = el('communitySelect');
    const switchBtn = el('switchCommunityBtn');
    const copyBtn = el('copyCommunityIdBtn');
    const roleLabel = el('communityRoleLabel');
    const loginSelect = el('loginCommunitySelect');
    if (select){
      const list = window.communities.listLocal();
      select.innerHTML = '';
      const active = window.communities.getActiveId();
      list.forEach(c=>{
        const opt = document.createElement('option');
        opt.value = c.id; opt.textContent = `${c.name} (${c.id})`;
        if (c.id === active) opt.selected = true;
        select.appendChild(opt);
      });
      // Set role label if possible
      const current = JSON.parse(localStorage.getItem('currentUser')||'null');
      const thisComm = list.find(c=>c.id===active);
      const role = (thisComm && current && thisComm.members && thisComm.members[current.id]?.role) || '-';
      if (roleLabel) roleLabel.textContent = role;
    }
    // Populate login community select
    if (loginSelect){
      const list = window.communities.listLocal();
      loginSelect.innerHTML = '<option value="">Selecione...</option>';
      const active = window.communities.getActiveId();
      list.forEach(c=>{
        const opt = document.createElement('option');
        opt.value = c.id; opt.textContent = `${c.name} (${c.id})`;
        if (c.id === active) opt.selected = true;
        loginSelect.appendChild(opt);
      });
      loginSelect.onchange = function(){
        const id = loginSelect.value;
        if (id){ window.communities.switchTo(id); }
      };
    }
    if (switchBtn && select){
      switchBtn.onclick = function(){
        const id = select.value;
        const ok = window.communities.switchTo(id);
        const fb = el('communitySwitchFeedback');
        if (fb) fb.textContent = ok ? 'Comunidade alterada.' : 'Falha ao alterar.';
        // Update role label after switch
        const list = window.communities.listLocal();
        const current = JSON.parse(localStorage.getItem('currentUser')||'null');
        const thisComm = list.find(c=>c.id===id);
        const role = (thisComm && current && thisComm.members && thisComm.members[current.id]?.role) || '-';
        if (roleLabel) roleLabel.textContent = role;
      };
    }
    if (copyBtn && select){
      copyBtn.onclick = function(){
        const id = select.value;
        navigator.clipboard.writeText(id||'').then(()=>{
          const fb = el('communitySwitchFeedback');
          if (fb) { fb.textContent = 'ID copiado.'; setTimeout(()=> fb.textContent='', 1500); }
        }).catch(()=>{
          const fb = el('communitySwitchFeedback');
          if (fb) fb.textContent = 'Falha ao copiar ID.';
        });
      };
    }
    // Load pending members for admin
    (async function(){
      const container = el('pendingMembersList');
      const cid = window.communities.getActiveId();
      if (!container || !cid){ return; }
      try {
        const current = JSON.parse(localStorage.getItem('currentUser')||'null');
        const localCommunities = window.communities.listLocal();
        const thisComm = localCommunities.find(c=>c.id===cid);
        const isAdmin = !!(thisComm && thisComm.members && current && thisComm.members[current.id]?.role==='admin');
        const pending = await window.communities.fetchPending(cid);
        const entries = Object.entries(pending);
        if (!entries.length){ container.innerHTML = '<p style="color: var(--gray);">Nenhuma solicitação.</p>'; return; }
        const frag = document.createDocumentFragment();
        entries.forEach(([uid, info])=>{
          const row = document.createElement('div');
          row.style.display = 'flex'; row.style.justifyContent='space-between'; row.style.alignItems='center'; row.style.padding='8px 0';
          row.innerHTML = `<span>${info.email||uid}</span>`;
          if (isAdmin){
            const btn = document.createElement('button');
            btn.className = 'btn btn-sm btn-success';
            btn.textContent = 'Aprovar';
            btn.onclick = async ()=>{
              btn.disabled = true;
              try { await window.communities.approveMember(cid, uid); row.remove(); }
              catch(e){ btn.disabled=false; alert('Falha ao aprovar: '+(e.message||e)); }
            };
            row.appendChild(btn);
          }
          frag.appendChild(row);
        });
        container.innerHTML = '';
        container.appendChild(frag);
      } catch(e){ console.warn('Erro ao carregar pendentes:', e); }
    })();
  });
})();
