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
  }

  // Expose helpers for sync namespace usage
  window.communities = {
    getActiveId: ()=> localStorage.getItem('activeCommunityId') || null,
    listLocal: ()=> JSON.parse(localStorage.getItem('communities')||'[]'),
    switchTo: function(id){
      if (!id) return false;
      localStorage.setItem('activeCommunityId', id);
      window.dispatchEvent(new CustomEvent('community:changed', { detail: { id } }));
      setActiveCommunityLabel();
      return true;
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
