# IoT Air Quality Dashboard — ENIS Sfax

> Système de surveillance et prédiction de la pollution de l'air en milieu industriel.

## Structure du projet

```
src/
├── main.jsx                        # Point d'entrée React
├── App.jsx                         # Composant racine
├── index.css                       # Variables CSS globales & reset
│
├── constants/
│   └── thresholds.js               # Seuils capteurs, config MQTT/API, AQI
│
├── utils/
│   ├── sensorHelpers.js            # Calculs AQI, états, simulation, prédictions
│   └── formatters.js               # Formatage dates/heures, utilitaires tableau
│
├── hooks/
│   ├── useSensorData.js            # Hook principal — données + logique métier
│   └── useMqtt.js                  # Connexion MQTT WebSocket (broker réel)
│
├── pages/
│   ├── DashboardPage.jsx           # Assemblage de la page principale
│   └── DashboardPage.module.css
│
└── components/
    ├── layout/
    │   ├── Topbar.jsx              # Barre de navigation + statut connexion
    │   └── Topbar.module.css
    │
    ├── ui/
    │   ├── StatusBadge.jsx         # Badge Normal / Attention / Critique
    │   └── StatusBadge.module.css
    │
    ├── cards/
    │   ├── MetricCard.jsx          # Carte capteur (CO₂, gaz, temp, hum)
    │   └── MetricCard.module.css
    │
    ├── charts/
    │   ├── HistoryChart.jsx        # Graphique temps réel Chart.js
    │   ├── HistoryChart.module.css
    │   ├── AqiGauge.jsx            # Jauge donut AQI
    │   └── AqiGauge.module.css
    │
    ├── alerts/
    │   ├── AlertFeed.jsx           # Journal des alertes horodaté
    │   └── AlertFeed.module.css
    │
    ├── predictions/
    │   ├── PredictionPanel.jsx     # Prédictions ML (Isolation Forest)
    │   └── PredictionPanel.module.css
    │
    └── actuators/
        ├── ActuatorPanel.jsx       # Contrôle ventilateur + alarme
        └── ActuatorPanel.module.css
```

## Installation

```bash
npm install
cp .env.example .env
npm run dev
```

## Connexion au backend réel

### FastAPI (polling REST)
Dans `src/hooks/useSensorData.js`, remplacez la ligne :
```js
const data = simulateSensorData(sc);
```
par :
```js
const { data } = await axios.get("/api/data");
```

### MQTT (temps réel)
Utilisez le hook `useMqtt` déjà fourni dans `src/hooks/useMqtt.js` :
```js
const { lastMessage, connected } = useMqtt();
useEffect(() => {
  if (lastMessage) setReadings(lastMessage);
}, [lastMessage]);
```

## Technologies utilisées

| Couche        | Technologie            |
|---------------|------------------------|
| UI            | React 18 + CSS Modules |
| Graphiques    | Chart.js 4             |
| Communication | MQTT.js (WebSocket)    |
| API           | Axios → FastAPI        |
| Build         | Vite 5                 |
