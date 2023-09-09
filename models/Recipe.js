const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    ingredients: [{
        name: String,
        quantity: String,
        weight: String
    }],
    category: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;