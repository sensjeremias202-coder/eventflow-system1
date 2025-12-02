// Inicialização dinâmica do Firebase (v8) para sincronização online
(function(){
  window.initFirebaseFromConfig = function(){
    try {
      var cfgRaw = localStorage.getItem('FIREBASE_CONFIG');
      if (!cfgRaw) {
        console.warn('[firebase-init] Nenhuma configuração encontrada (FIREBASE_CONFIG)');
        return false;
      }
      var config = JSON.parse(cfgRaw);
      if (!config || !config.apiKey) {
        console.warn('[firebase-init] Config inválida');
        return false;
      }
      // Carregar scripts v8 se necessário
      function loadScript(src){
        return new Promise(function(res, rej){
          var s = document.createElement('script');
          s.src = src; s.async = true;
          s.onload = function(){ res(); };
          s.onerror = function(){ rej(new Error('Falha ao carregar ' + src)); };
          document.head.appendChild(s);
        });
      }
      var needFirebase = (typeof window.firebase === 'undefined');
      var chain = Promise.resolve();
      if (needFirebase) {
        chain = chain
          .then(function(){ return loadScript('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js'); })
          .then(function(){ return loadScript('https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js'); });
      }
      chain.then(function(){
        if (!window.firebase || !window.firebase.initializeApp) {
          console.error('[firebase-init] SDK não disponível');
          return false;
        }
        if (!window.firebaseInitialized) {
          window.firebase.initializeApp(config);
          window.firebaseInitialized = true;
          window.firebaseDatabase = window.firebase.database();
          console.log('[firebase-init] ✅ Firebase inicializado');
        } else {
          console.log('[firebase-init] Firebase já inicializado');
        }
        // Re-inicializar sync para ativar modo online
        if (typeof window.initSync === 'function') {
          try { window.initSync(); } catch(e){ console.warn('[firebase-init] falha ao reiniciar sync', e); }
        }
        return true;
      }).catch(function(err){
        console.warn('[firebase-init] Erro ao carregar SDK:', err);
        return false;
      });
    } catch(e){
      console.warn('[firebase-init] Erro na inicialização:', e);
      return false;
    }
  };
})();
