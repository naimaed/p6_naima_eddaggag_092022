/**
 * Import de bcrypt pour la sécurité d'un élement
 * Import de jsonwebtoken pour sécurisé le token
 * Import du dossier .env pour sécurisé un élement
 */
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/Users");
require("dotenv").config();

/**
 * Crypter le mot de passe 10x pour la sécurité du champ
 * Hashage du mot de passe
 * Ajout de l'utilisateur dans la BDD après la création du compte
 */
exports.signup = (req, res) => {
	bcrypt

		.hash(req.body.password, 10)
		.then((hash) => {
			const user = new User({
				email: req.body.email,
				password: hash,
			});
			user
				.save()
				.then(() => res.status(201).json({ message: "Utilisateur créé !" }))
				.catch((error) => res.status(400).json({ error }));
		})
		.catch((error) => res.status(500).json({ error }));
};

/**
 * Vérification lors du login pour savoir si les éléments dans le body existe dans la BDD
 * Utilisation de .compare grâce à l'import de bcrypt qui permet ici de comparer le mdp du body et celui de la BDD
 * Lors de la connection on obtien l'userId + un Token qui a été noté dans le .env + un délai du token de 24h
 */
exports.login = (req, res) => {
	User.findOne({ email: req.body.email })
		.then((user) => {
			if (!user) {
				return res
					.status(401)
					.json({ error: "Email/Mot de passe incorrect !" });
			}
			bcrypt
				.compare(req.body.password, user.password)
				.then((valid) => {
					if (!valid) {
						return res
							.status(401)
							.json({ error: "Email/Mot de passe incorrect !" });
					}
					res.status(200).json({
						userId: user._id,
						token: jwt.sign({ userId: user._id }, process.env.TOKEN_KEY, {
							expiresIn: "24h",
						}),
					});
				})
				.catch((error) => {
					console.log("error", error);
				});
		})
		.catch((error) => res.status(500).json({ error }));
};
