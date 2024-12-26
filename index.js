const express = require("express");
const net = require("net");
const cors = require("cors");
const path = require("path"); // Import path module for serving static files

const app = express();
const PORT = 3000;

// IP-Adresse und Port des Raspberry Pi
const RASPBERRY_PI_HOST = "192.168.1.101";
const RASPBERRY_PI_PORT = 65432;

// Middleware für JSON-Parsing und CORS
app.use(express.json());
app.use(cors());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, "public")));

// Funktion zum Senden von Nachrichten an den Raspberry Pi
function sendMessageToRaspberryPi(message, res) {
    const client = new net.Socket();
    client.connect(RASPBERRY_PI_PORT, RASPBERRY_PI_HOST, () => {
        client.write(message);
        client.end();
    });

    client.on("error", (err) => {
        console.error("Fehler beim Verbinden mit Raspberry Pi:", err.message);
        res.status(500).send("Fehler beim Verbinden mit Raspberry Pi");
    });

    client.on("close", () => {
        res.send("Nachricht erfolgreich gesendet");
    });
}

// API-Endpunkt: Button-Event
app.post("/button", (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).send("Fehlender Nachrichtentext");
    }
    sendMessageToRaspberryPi(message, res);
});

// API-Endpunkt: Slider-Event
app.post("/slider", (req, res) => {
    const { identifier, value } = req.body;
    if (!identifier || value === undefined) {
        return res.status(400).send("Fehlende Daten für den Slider");
    }
    const message = `${identifier}:${value}`;
    sendMessageToRaspberryPi(message, res);
});

// Server starten
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});