// Configuração do Firebase para EventFlow System
// Usando Firebase Realtime Database para sincronização em tempo real

const firebaseConfig = {
    apiKey: "AIzaSyB6kTX011BWxg84uValylAWPRSYyvzibNQ",
    authDomain: "eventflow-system-2.firebaseapp.com",
    databaseURL: "https://eventflow-system-2-default-rtdb.firebaseio.com",
    projectId: "eventflow-system-2",
    storageBucket: "eventflow-system-2.firebasestorage.app",
    messagingSenderId: "675107796968",
    appId: "1:675107796968:web:6e0899b58b7be2b2dd565d",
    measurementId: "G-VKBP2DGQ47"
};

// Ativar Firebase (true = sincronização entre dispositivos, false = apenas local)
const USE_FIREBASE = true;

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

        // Inicializar Firebase App
        firebaseApp = firebase.initializeApp(firebaseConfig);
        database = firebase.database();

        console.log('[firebase] Firebase inicializado com sucesso');
        console.log('[firebase] Projeto:', firebaseConfig.projectId);
        return true;
    } catch (error) {
        console.error('[firebase] Erro ao inicializar Firebase:', error);
        console.warn('[firebase] Usando modo local como fallback');
        return false;
    }
}

// Exportar para uso global
window.firebaseInitialized = initFirebase();
window.firebaseDatabase = database;
