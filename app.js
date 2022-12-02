// * Import du framework Express pour mieux coder un serveur Node
const express = require("express");
// * Import de Mongoose pour avoir une BDD
const mongoose = require("mongoose");
// * Import du dossier .env pour ajouter des élements sécurisé
require("dotenv").config();
// * Import de bodyParser qui analyse les données codées en JSON...
const bodyParser = require("body-parser");
// * Import de path pour travailler avec les chemins de fichiers
const path = require("path");

// Import d'élement depuis un autre fichier
const saucesRoutes = require("./routes/sauces");
const userRoutes = require("./routes/users");

console.log("url", process.env.MONGODB_PATH);
// Fonction .connect pour lier notre BDD à notre serveur
mongoose
	.connect(process.env.MONGODB_PATH)
	// var mongoMask = require('mongo-mask')
	.then(() => console.log("Connexion à MongoDB réussie !"))
	.catch((error) => console.log("Connexion à MongoDB échouée !", error));

const app = express();
app.use(express.json());

// Fonction .setHeader pour ajouter des conditions dans les headers
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
	);
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, DELETE, PATCH, OPTIONS"
	);
	next();
});

app.use(bodyParser.json());

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/sauces", saucesRoutes);
app.use("/api/auth", userRoutes);

module.exports = app;
