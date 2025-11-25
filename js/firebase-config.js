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
// IMPORTANTE: Defina como false se você não tiver configurado o Firebase Realtime Database
const USE_FIREBASE = false; // Mude para true após criar o Realtime Database no Firebase Console

let firebaseApp = null;
let database = null;

// Inicializar Firebase
function initFirebase() {
    if (!USE_FIREBASE) {
        console.log('[firebase] ⚠️ Firebase desabilitado - usando apenas localStorage');
        console.log('[firebase] 💡 Para habilitar sincronização entre dispositivos:');
        console.log('[firebase] 1. Acesse: https://console.firebase.google.com/');
        console.log('[firebase] 2. Vá em "Realtime Database" e clique em "Criar banco de dados"');
        console.log('[firebase] 3. Escolha um local e inicie em "modo de teste"');
        console.log('[firebase] 4. Mude USE_FIREBASE para true no arquivo firebase-config.js');
        return false;
    }

    try {
        // Verificar se Firebase está disponível
        if (typeof firebase === 'undefined') {
            console.error('[firebase] ❌ Firebase SDK não carregado');
            return false;
        }

        // Inicializar Firebase App
        firebaseApp = firebase.initializeApp(firebaseConfig);
        database = firebase.database();

        console.log('[firebase] ✅ Firebase inicializado com sucesso');
        console.log('[firebase] Projeto:', firebaseConfig.projectId);
        console.log('[firebase] Database URL:', firebaseConfig.databaseURL);
        return true;
    } catch (error) {
        console.error('[firebase] ❌ Erro ao inicializar Firebase:', error.message);
        console.warn('[firebase] ⚠️ Usando modo local como fallback');
        console.log('[firebase] 💡 Possíveis causas:');
        console.log('[firebase] - Realtime Database não foi criado no Firebase Console');
        console.log('[firebase] - URL do database incorreta');
        console.log('[firebase] - Regras de segurança muito restritivas');
        return false;
    }
}

// Exportar para uso global
window.firebaseInitialized = initFirebase();
window.firebaseDatabase = database;

// Função para fazer upload inicial dos dados locais para o Firebase
if (window.firebaseInitialized && window.firebaseDatabase) {
    // Verificar se há dados no Firebase
    window.firebaseDatabase.ref('/events').once('value', (snapshot) => {
        const firebaseData = snapshot.val();
        
        if (!firebaseData || Object.keys(firebaseData).length === 0) {
            console.log('[firebase] 📤 Nenhum dado encontrado no Firebase. Fazendo upload inicial...');
            
            // Fazer upload dos dados locais se existirem
            const localEvents = JSON.parse(localStorage.getItem('events') || '[]');
            const localCategories = JSON.parse(localStorage.getItem('categories') || '[]');
            const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const localMessages = JSON.parse(localStorage.getItem('messages') || '[]');
            
            if (localEvents.length > 0 || localCategories.length > 0 || localUsers.length > 0) {
                const updates = {};
                
                // Converter arrays para objetos
                const eventsObj = {};
                localEvents.forEach(e => { eventsObj[e.id] = e; });
                
                const categoriesObj = {};
                localCategories.forEach(c => { categoriesObj[c.id] = c; });
                
                const usersObj = {};
                localUsers.forEach(u => { usersObj[u.id] = u; });
                
                const messagesObj = {};
                localMessages.forEach(m => { messagesObj[m.id] = m; });
                
                updates['/events'] = eventsObj;
                updates['/categories'] = categoriesObj;
                updates['/users'] = usersObj;
                updates['/messages'] = messagesObj;
                updates['/lastUpdate'] = Date.now();
                
                window.firebaseDatabase.ref().update(updates)
                    .then(() => {
                        console.log('[firebase] ✅ Upload inicial concluído com sucesso!');
                        console.log('[firebase] Dados enviados:', {
                            eventos: localEvents.length,
                            categorias: localCategories.length,
                            usuarios: localUsers.length,
                            mensagens: localMessages.length
                        });
                    })
                    .catch((error) => {
                        console.error('[firebase] ❌ Erro no upload inicial:', error);
                    });
            } else {
                console.log('[firebase] ℹ️ Nenhum dado local para fazer upload');
            }
        } else {
            console.log('[firebase] ✅ Dados já existem no Firebase');
            console.log('[firebase] Eventos no Firebase:', Object.keys(firebaseData).length);
        }
    });
    
    // Teste de conexão
    window.firebaseDatabase.ref('.info/connected').on('value', (snapshot) => {
        if (snapshot.val() === true) {
            console.log('[firebase] 🟢 Conectado ao Firebase Realtime Database');
        } else {
            console.log('[firebase] 🔴 Desconectado do Firebase');
        }
    });
}
