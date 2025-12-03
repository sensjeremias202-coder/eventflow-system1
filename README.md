# EventFlow System

## Regras do Firebase (Realtime Database)

Este projeto utiliza o Firebase Realtime Database com isolamento por comunidade. As regras estão em `firebase.rules.json` e restringem leitura/gravação ao namespace `communities/{communityId}`:

- Eventos: leitura por membros; escrita por `admin`. Inscrições (`events/{id}/enrolled`) podem ser gravadas por qualquer membro.
- Categorias e Usuários: leitura por membros; escrita apenas por `admin`.
- Membros/Pendências: leitura por membros; escrita apenas por `admin`.
- Mensagens: leitura e escrita por membros.

### Publicar regras via Firebase CLI

Pré-requisitos: `firebase-tools` instalado e projeto configurado.

```powershell
npm install -g firebase-tools
firebase login
firebase use <SEU_PROJECT_ID>
firebase deploy --only database
```

Alternativamente, se você usa `firebase.json`, inclua:

```json
{
	"database": {
		"rules": "firebase.rules.json"
	}
}
```

Então execute:

```powershell
firebase deploy --only database
```

## Desenvolvimento

Veja `index.html` e a pasta `js/` para os módulos de autenticação, comunidades e sincronização.
