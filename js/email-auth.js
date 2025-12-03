(function(){
  // Basic Firebase Email Link Auth integration
  // Requires firebase-app-compat and firebase-auth-compat (loaded via CDN if added)
  // We'll guard execution if firebase is not available or config not set.
  const ONLINE_SYNC = localStorage.getItem('ONLINE_SYNC') === 'true';
  const cfg = window.FIREBASE_CONFIG || null;
  if (!cfg || !window.firebase || !ONLINE_SYNC) {
    // no-op in local mode
    return;
  }
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(cfg);
    }
  } catch(e) {
    console.warn('Firebase init skipped in email-auth:', e);
  }
  if (!firebase.auth) {
    console.warn('Firebase Auth compat not loaded.');
    return;
  }
  const auth = firebase.auth();

  // Expose simple API
  window.emailAuth = {
    sendSignInLink: async function(email){
      const actionCodeSettings = {
        url: window.location.href,
        handleCodeInApp: true
      };
      await auth.sendSignInLinkToEmail(email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      return true;
    },
    completeFromLink: async function(){
      if (auth.isSignInWithEmailLink && auth.isSignInWithEmailLink(window.location.href)){
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email){
          email = window.prompt('Confirme seu e-mail para login:');
        }
        const result = await auth.signInWithEmailLink(email, window.location.href);
        window.localStorage.removeItem('emailForSignIn');
        const user = result.user;
        // Map Firebase user to app's currentUser structure (minimal)
        const currentUser = {
          id: user.uid,
          name: user.displayName || (user.email ? user.email.split('@')[0] : 'Usuário'),
          email: user.email,
          role: 'user',
          provider: 'firebase-email-link'
        };
        window.localStorage.setItem('currentUser', JSON.stringify(currentUser));
        // Resume pending enrollment if flagged
        const pendingId = window.localStorage.getItem('pendingEnrollmentEventId');
        if (pendingId){
          window.localStorage.setItem('bypassEnrollmentModalOnce', 'true');
        }
        // Redirect to app
        document.getElementById('publicHome')?.style && (document.getElementById('publicHome').style.display='none');
        document.getElementById('loginScreen')?.style && (document.getElementById('loginScreen').style.display='none');
        document.getElementById('app')?.style && (document.getElementById('app').style.display='block');
        return currentUser;
      }
      return null;
    }
  };

  // Auto-complete if link contains parameters
  (function autoComplete(){
    emailAuth.completeFromLink().catch(err => console.error('Email link completion error', err));
  })();
})();
