# TrainPreddict - API

L'application TrainPreddict communique avec les bases de données et les intelligences artifielles grâce à cette API REST.

Les données générales coureurs sont accessibles par les routes:
`https://trainpreddict.fr:5000/api/*`
Elles sont localisées:
`/routes/coureurs`
Les données sur les séances sont accessibles par les routes:
`https://trainpreddict.fr:5000/api/seances/*`
Elles sont localisées:
`/routes/seances`
Les données générales coureurs sont accessibles par les routes:
`https://trainpreddict.fr:5000/api/assistants/*`
Elles sont localisées:
`/routes/assistants`

# Table de matières
[1) Packages](#packages)\
[2) Assistant](#assitant)

# Packages <a id="packages"></a>
```json
"bcryptjs": "^2.4.3",
"body-parser": "^1.19.0",
"concurrently": "^5.3.0",
"config": "^3.3.1",
"cors": "^2.8.5",
"dayjs": "^1.9.3",
"dotenv": "^9.0.1",
"express": "^4.17.1",
"express-favicon": "^2.0.1",
"express-fileupload": "^1.2.0",
"express-logger": "^0.0.2",
"express-session": "^1.17.1",
"express-validator": "^6.6.0",
"fit-file-parser": "^1.8.4",
"fs": "0.0.1-security",
"http": "0.0.1-security",
"https": "^1.0.0",
"jsonwebtoken": "^8.5.1",
"mongodb": "^3.5.9",
"mongoose": "^5.9.25",
"nodemailer": "^6.4.18",
"nodemon": "^2.0.5",
"pm2": "^4.5.6",
"util": "^0.12.3",
"validator": "^13.1.17"
```

# Assitant <a id="assitant"></a>
Utilisateur de type 'Coach' et 'Club'
'Coureur' -> 'Coach' ou 'Club' avec _structure

Création d'une structure `routes/assistants/auth.js`
```javascript
/**
 * @route POST /api/assistant/register
 * @description création d'un compte structure avec envoie d'un mail à contact@trainpreddict.fr pour validation
 */
 ```

Affiliation à une structure `routes/assistants/affiliation.js`
```javascript
/**
 * @route POST /api/assistant/affiliation/:userId
 * @description Affiliation d'un compte à une structure grâce à l'id
 * */
 ```

Récupérer les comptes affilié à une structure `routes/assistants/affiliation.js`
```javascript
/**
 * @route GET /api/assitant/affiliation
 * @description Récupération de tous les comptes affiliés à la structure
 */
 ```

Création d'un utilisateur qu'on affilie à une structure `routes/assistants/affiliation.js`
```javascript
 /**
 * @route post /api/assistant
 * @description permet de créer un nouvel utilisateur et de l'affilié à la structure
 */
```