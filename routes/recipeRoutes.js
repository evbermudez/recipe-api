const express = require('express');
const jwt = require('jsonwebtoken');
const Recipe = require('../models/Recipe');
const User = require('../models/User');

const router = express.Router();

const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send('No token, authorization denied');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).send('Token is not valid');
    }
};

router.post('/add', auth, async (req, res) => {
    try {
        const { title, ingredients, category } = req.body;
        const newRecipe = new Recipe({ title, ingredients, category, author: req.user.userId });

        const savedRecipe = await newRecipe.save();

        await User.findByIdAndUpdate(req.user.userId, { $push: { createdRecipes: savedRecipe._id } });

        res.status(201).json(savedRecipe);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.get('/', async (req, res) => {
    try {
        const recipes = await Recipe.find().populate('author', 'username');
        res.json(recipes);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id).populate('author', 'username');

        if (!recipe) {
            return res.status(404).send('Recipe not found');
        }

        res.json(recipe);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        let recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).send('Recipe not found');
        }

        // Ensure the logged-in user is the author of the recipe
        if (recipe.author.toString() !== req.user.userId) {
            return res.status(403).send('Not authorized to update this recipe');
        }

        const updates = Object.keys(req.body);
        const allowedUpdates = ['title', 'ingredients', 'category']; // Add more fields as needed
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).send('Invalid updates!');
        }

        // Update the recipe
        updates.forEach(update => recipe[update] = req.body[update]);
        await recipe.save();

        res.json(recipe);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).send('Recipe not found');
        }

        // Ensure the logged-in user is the author of the recipe
        if (recipe.author.toString() !== req.user.userId) {
            return res.status(403).send('Not authorized to delete this recipe');
        }

        await recipe.remove();

        // Optionally remove the recipe's reference from the User's createdRecipes array
        await User.findByIdAndUpdate(req.user.userId, { $pull: { createdRecipes: recipe._id } });

        res.json({ message: 'Recipe deleted' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;