/**
 * Import du model des sauces
 * Import de fs : module de système de fichiers Node.js permet de travailler avec le système de fichiers
 */
const Sauce = require("../models/Sauces");
const fs = require("fs");

/**
 * Const sauceObject récupère les éléments du body puis on le transforme en JSON grâce à .parse
 * Suppression de l'_id et l'userId de la sauce
 * Ajout de l'image dans le dossier images lors de la création de la sauce
 * Ajout par défaut likes et dislikes à 0 lors de la création de la sauce
 * Envoi dans la BDD après création de la sauce
 */
exports.createSauce = (req, res) => {
	const sauceObject = JSON.parse(req.body.sauce);
	delete sauceObject._id;
	delete sauceObject._userId;
	const sauce = new Sauce({
		...sauceObject,
		userId: req.auth.userId,
		imageUrl: `${req.protocol}://${req.get("host")}/images/${
			req.file.filename
		}`,
		likes: 0,
		dislikes: 0,
	});

	sauce
		.save()
		.then(() => {
			res.status(201).json({ message: "Sauce enregistré !" });
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

/**
 * Vérification de l'utilisateur pour permettre ou non la modification de la sauce
 * Si Non = msg d'erreur, si Oui = maj dans la BDD
 */
exports.modifySauce = (req, res) => {
	const sauceObject = req.file
		? {
				...JSON.parse(req.body.sauce),

				imageUrl: `${req.protocol}://${req.get("host")}/images/${
					req.file.filename
				}`,
		  }
		: { ...req.body };

	delete sauceObject._userId;
	Sauce.findOne({ _id: req.params.id })
		.then((sauce) => {
			if (sauce.userId != req.auth.userId) {
				res.status(403).json({ message: "Not authorized" });
			} else {
				Sauce.updateOne(
					{ _id: req.params.id },
					{ ...sauceObject, _id: req.params.id }
				)
					.then(() => {
						if (sauceObject.imageUrl) {
							const oldFilename = sauce.imageUrl.split("images/")[1];
							fs.unlink(`images/${oldFilename}`, (error) => {
								if (error) console.log("error", error);
							});
						}
						return res.status(200).json({ message: "Sauce modifié!" });
					})

					.catch((error) => {
						res.status(401).json({ error });
						console.log(error);
					});
			}
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

/**
 * Vérification de l'utilisateur pour permettre ou non la suppression de la sauce
 * Si autorisé = Suppression de l'image grâce à .unlink du dossier image + suppression de la sauce dans la BDD
 */
exports.deleteSauce = (req, res) => {
	Sauce.findOne({ _id: req.params.id })
		.then((sauce) => {
			if (sauce.userId != req.auth.userId) {
				res.status(401).json({ message: "Not authorized" });
			} else {
				const filename = sauce.imageUrl.split("/images/")[1];
				fs.unlink(`images/${filename}`, () => {
					Sauce.deleteOne({ _id: req.params.id })
						.then(() => {
							res.status(200).json({ message: "Sauce supprimé !" });
						})
						.catch((error) => res.status(401).json({ error }));
				});
			}
		})
		.catch((error) => {
			res.status(500).json({ error });
		});
};

// Afficher une sauce
exports.getOneSauce = (req, res) => {
	Sauce.findOne({ _id: req.params.id })
		.then((sauce) => res.status(200).json(sauce))
		.catch((error) => res.status(404).json({ error }));
};

// Afficher toutes les sauces
exports.getAllSauces = (req, res) => {
	Sauce.find()
		.then((sauces) => res.status(200).json(sauces))
		.catch((error) => res.status(400).json({ error }));
};

/**
 * Utilisation de la méthode .includes pour trouver un élement dans un tableau
 * Utilisation de $inc pour incrémenter une valeur à un élément ( ici aux likes/dislikes )
 * Utilisation de $push pour ajouter un élément au tableau
 * Utilisation de $pull pour retirer un élément du tableau
 * Utilisation de switch avec les différents cas possible : -1, 0, 1.
 */
exports.likeSauce = (req, res) => {
	Sauce.findOne({ _id: req.params.id })
		.then((sauce) => {
			switch (req.body.like) {
				case 1:
					if (
						!sauce.usersLiked.includes(req.body.userId) &&
						req.body.like === 1
					) {
						Sauce.updateOne(
							{ _id: req.params.id },
							{
								$inc: { likes: 1 },
								$push: { usersLiked: req.body.userId },
							}
						)
							.then(() => res.status(201).json({ message: "Sauce liked +1" }))
							.catch((error) => res.status(400).json({ error }));
					}
					break;

				case -1:
					if (
						!sauce.usersDisliked.includes(req.body.userId) &&
						req.body.like === -1
					) {
						Sauce.updateOne(
							{ _id: req.params.id },
							{
								$inc: { dislikes: 1 },
								$push: { usersDisliked: req.body.userId },
							}
						)
							.then(() =>
								res.status(201).json({ message: "Sauce disliked +1" })
							)
							.catch((error) => res.status(400).json({ error }));
					}
					break;

				case 0:
					if (sauce.usersLiked.includes(req.body.userId)) {
						Sauce.updateOne(
							{ _id: req.params.id },
							{
								$inc: { likes: -1 },
								$pull: { usersLiked: req.body.userId },
							}
						)
							.then(() => res.status(201).json({ message: "Sauce liked 0" }))
							.catch((error) => res.status(400).json({ error }));
					}

					if (sauce.usersDisliked.includes(req.body.userId)) {
						Sauce.updateOne(
							{ _id: req.params.id },
							{
								$inc: { dislikes: -1 },
								$pull: { usersDisliked: req.body.userId },
							}
						)
							.then(() => res.status(201).json({ message: "Sauce disliked 0" }))
							.catch((error) => res.status(400).json({ error }));
					}
					break;
			}
		})
		.catch((error) => res.status(404).json({ error }));
};
