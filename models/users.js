// / Import d'une fonction de mongoose (unique-validator) pour rendre un élement unique
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

// Schema de l'utilisateur qui sera envoyé dans la BDD
const userSchema = mongoose.Schema({
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
