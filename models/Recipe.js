const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
    ingredient: { type: String, required: true },
});

const instructionSchema = new mongoose.Schema({
    sequence: { type: Number, required: true },
    instruction: { type: String, required: true }
});

const recipeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    ingredients: [ingredientSchema],  // Embedding ingredient schema
    instructions: [instructionSchema], // Embedding instruction schema
    category: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Recipe = mongoose.model('Recipe', recipeSchema);
module.exports = Recipe;