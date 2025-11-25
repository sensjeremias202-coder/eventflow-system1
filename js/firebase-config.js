// Configuração do Firebase
// IMPORTANTE: Substitua essas credenciais pelas suas próprias do Firebase Console
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "seu-projeto.firebaseapp.com",
    databaseURL: "https://seu-projeto-default-rtdb.firebaseio.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};

// Configuração de demonstração (funciona sem Firebase - apenas localStorage)
const USE_FIREBASE = false; // Altere para true após configurar suas credenciais

let firebaseApp = null;
let database = null;

// Inicializar Firebase
function initFirebase() {
    if (!USE_FIREBASE) {
        console.log('[firebase] Modo demonstração - usando apenas localStorage');
        return false;
    }

    try {
        // Verificar se Firebase está disponível
        if (typeof firebase === 'undefined') {
            console.error('[firebase] Firebase SDK não carregado');
            return false;
        }

        // Validar configuração
        if (firebaseConfig.apiKey === 'SUA_API_KEY_AQUI') {
            console.warn('[firebase] Configure suas credenciais no arquivo firebase-config.js');
            console.log('[firebase] Veja instruções em: FIREBASE_SETUP.md');
            return false;
        }

        // Inicializar Firebase
        firebaseApp = firebase.initializeApp(firebaseConfig);
        database = firebase.database();

        console.log('[firebase] Firebase inicializado com sucesso');
        return true;
    } catch (error) {
        console.error('[firebase] Erro ao inicializar Firebase:', error);
        return false;
    }
}

// Exportar para uso global
window.firebaseInitialized = initFirebase();
window.firebaseDatabase = database;
