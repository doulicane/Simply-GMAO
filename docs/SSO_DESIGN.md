# Design — Authentification SSO (Active Directory / LDAP)

## Version
1.0 — Sprint 14

## Contexte
L'usine Simply GMAO utilise Active Directory (AD) pour la gestion des identités. Les techniciens et opérateurs ont déjà des comptes Windows. L'objectif est d'intégrer la GMAO à l'AD pour éviter la double authentification.

## Options envisagées

| Option | Librairie | Avantage | Inconvénient |
|--------|-----------|----------|--------------|
| **LDAP direct** | `passport-ldapauth` | Simple, pas de SAML | Mots de passe en transit |
| **SAML 2.0** | `passport-saml` | Standard, sécurisé | Complexité config certificats |
| **Kerberos** | `passport-kerberos` | SSO transparent Windows | Nécessite domaine joint |

## Recommandation
**Option SAML 2.0** avec `passport-saml` pour la sécurité et la standardisation.

## Architecture

```
┌─────────────┐     1. Accès GMAO        ┌─────────────┐
│  Utilisateur│ ────────────────────────> │   GMAO SPA  │
│  (navigateur)│    2. Redirection SAML   │  (frontend) │
└─────────────┘ <──────────────────────── └─────────────┘
       │                                         │
       │ 3. Authentification AD                  │ 4. Assertion SAML
       │                                         │
┌─────────────┐     5. Token JWT GMAO      ┌─────────────┐
│  IdP (AD FS)│ <───────────────────────── │  GMAO API   │
│  ou ADFS    │                            │  (backend)  │
└─────────────┘                            └─────────────┘
```

## Flow détaillé

1. **Utilisateur** accède à la GMAO (`https://gmao.simply-gmao.local`)
2. **Frontend** détecte pas de session → redirige vers `/api/auth/saml/login`
3. **Backend** génère une SAML AuthnRequest et redirige vers l'IdP (AD FS)
4. **IdP** authentifie l'utilisateur (Kerberos/NTLM transparent ou formulaire AD)
5. **IdP** POST l'assertion SAML sur `/api/auth/saml/callback`
6. **Backend** valide la signature, extrait l'email et les groupes AD
7. **Backend** crée/met à jour l'utilisateur en base (email → rôle GMAO)
8. **Backend** génère un JWT GMAO et redirige vers le frontend avec le token

## Mapping groupes AD → Rôles GMAO

| Groupe AD | Rôle GMAO |
|-----------|-----------|
| `GG_Simply GMAO_Maintenance_Resp` | `responsable` |
| `GG_Simply GMAO_Maintenance_Tech` | `technicien` |
| `GG_Simply GMAO_Magasin` | `magasinier` |
| `GG_Simply GMAO_Production` | `operateur` |
| `GG_Simply GMAO_HSE` | `hse` |
| `GG_Simply GMAO_IT_Admin` | `admin` |

## Implémentation technique

### Dépendances
```bash
npm install passport-saml xml2js
npm install -D @types/passport-saml
```

### Configuration
```typescript
// config/saml.ts
export const samlConfig = {
  entryPoint: 'https://adfs.simply-gmao.local/adfs/ls/',
  issuer: 'simply-gmao',
  callbackUrl: 'https://gmao.simply-gmao.local/api/auth/saml/callback',
  cert: fs.readFileSync('./certs/adfs-signing.crt', 'utf-8'),
  privateKey: fs.readFileSync('./certs/gmao-private.key', 'utf-8'),
  identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
};
```

### Routes
```typescript
// routes/authSaml.ts
router.get('/saml/login', passport.authenticate('saml'));
router.post('/saml/callback', passport.authenticate('saml', { session: false }), handleSamlLogin);
```

### Fallback
- Si SAML échoue → redirection vers login classique (JWT)
- Si utilisateur AD inconnu → création compte GMAO avec rôle par défaut `operateur`

## Sécurité
- Certificats X.509 rotation annuelle
- Assertion SAML chiffrée
- Clock skew tolérance : 60 secondes
- Signature XML strictement validée

## Roadmap
| Phase | Sprint | Livrable |
|-------|--------|----------|
| 1 | S14 | Design + environnement test ADFS |
| 2 | S15 | Implémentation passport-saml |
| 3 | S16 | Tests intégration AD réel |
| 4 | S17 | Déploiement production + fallback |
