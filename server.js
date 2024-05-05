require('dotenv').config();

const express = require('express');
const MQTT = require('mqtt');
const app = express();
const port = process.env.PORT || 3001;

// Opciones de conexión para MQTT sobre TLS
const options = {
    host: process.env.MQTT_HOST,
    port: process.env.MQTT_PORT,
    protocol: 'mqtts',
    //username: process.env.MQTT_USER,
    //password: process.env.MQTT_PASSWORD,
    // Si tu broker MQTT requiere un certificado CA específico
    // ca: fs.readFileSync('path_to_ca_certificate.pem')  // Descomentar si es necesario
};

const client = MQTT.connect(options);

// Objeto para almacenar los últimos datos recibidos de los sensores
let sensorData = {};

client.on('connect', () => {
    console.log('Conectado al broker MQTT vía TLS');
    client.subscribe('esp32/sensorData', (err) => {
        if (!err) {
            console.log('Suscripción exitosa');
        }
    });
});

client.on('message', (topic, message) => {
    console.log(`Mensaje recibido en el topic ${topic}: ${message.toString()}`);
    try {
        sensorData = JSON.parse(message.toString());
    } catch (e) {
        console.error('Error parsing JSON!', e);
    }
});


app.get('/api/sensor-data', (req, res) => {
    res.json(sensorData);
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});