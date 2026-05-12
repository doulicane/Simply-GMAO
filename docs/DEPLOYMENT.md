# Déploiement Local / Tablette — Simply GMAO

## Vue d'ensemble

Pour le réseau local usine (pas d'accès Internet), l'application est déployée sur une machine Windows (serveur local) et accessible depuis des tablettes Android/iPad via le réseau WiFi local.

**URL d'accès :** `https://192.168.1.22:3000`

## Prérequis

- Node.js 24+ installé sur le serveur
- PostgreSQL 16 en cours d'exécution (ou Docker)
- Redis 7 en cours d'exécution (ou Docker)
- mkcert installé (`choco install mkcert` ou `brew install mkcert`)
- IP fixe du serveur : `192.168.1.22`

## 1. Génération des certificats HTTPS (mkcert)

```bash
# Une seule fois — génère le CA local
cd "C:\Users\<user>\Desktop\Simply GMAO"
mkcert -install

# Génère les certificats pour l'IP du serveur
mkcert 192.168.1.22

# Les fichiers générés :
# - 192.168.1.22.pem       (certificat serveur)
# - 192.168.1.22-key.pem   (clé privée)
# - rootCA.pem             (CA à installer sur les tablettes)
```

## 2. Installation du CA sur les tablettes

### Android
1. Télécharger `rootCA.pem` depuis `http://192.168.1.22:8080/rootCA.pem`
2. Paramètres → Sécurité → Certificats → Installer un certificat CA
3. Sélectionner le fichier `rootCA.pem`
4. Confirmer "Installer quand même"

### iPad / iPhone
1. Télécharger `rootCA.pem` depuis Safari (`http://192.168.1.22:8080/rootCA.pem`)
2. Paramètres → Profil téléchargé → Installer
3. Paramètres → Général → À propos → Certificats racine → Activer le CA

> **Note :** Sans cette étape, le navigateur affichera "Connexion non privée" et le QR scanner ne fonctionnera pas.

## 3. Build du frontend

```bash
cd app
npm run build
```

Le build statique est généré dans `app/dist/`.

## 4. Lancement du backend (serve tout)

```bash
cd app/backend
npm run dev
# ou pour production :
# NODE_ENV=production npm start
```

Le backend :
- Écoute sur `0.0.0.0:3000`
- Sert l'API sur `/api/*`
- Sert le frontend statique sur `/*`
- Utilise HTTPS avec les certificats mkcert

## 5. Accès depuis les tablettes

Ouvrir Chrome/Safari et naviguer vers :
```
https://192.168.1.22:3000
```

L'application se charge comme une PWA (icône, mode standalone, offline possible).

## 6. Serveur de fichiers CA (optionnel)

Pour permettre aux tablettes de télécharger le `rootCA.pem`, lancer :

```bash
cd "C:\Users\<user>\Desktop\Simply GMAO"
python -m http.server 8080
```

Accessible depuis : `http://192.168.1.22:8080/rootCA.pem`

## Dépannage

### "Connexion non privée" / certificat non valide
→ Vérifier que le `rootCA.pem` est bien installé sur la tablette (étape 2).

### QR Scanner ne fonctionne pas
→ Nécessite HTTPS + caméra autorisée. Vérifier :
1. URL commence par `https://`
2. Le certificat est validé (pas d'avertissement)
3. Autorisation caméra accordée dans les paramètres du navigateur

### Frontend affiche une page blanche
→ Vérifier que `npm run build` a été exécuté et que `app/dist/` existe.

### API erreur 404
→ Vérifier que le backend est bien lancé et que les variables d'environnement `DATABASE_URL` et `REDIS_URL` sont correctes.

## Fichiers clés

| Fichier | Description |
|---------|-------------|
| `192.168.1.22.pem` | Certificat serveur HTTPS |
| `192.168.1.22-key.pem` | Clé privée serveur |
| `rootCA.pem` | CA racine (à installer sur tablettes) |
| `app/dist/` | Frontend buildé (statique) |
| `app/backend/src/index.ts` | Point d'entrée backend |
