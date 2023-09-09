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

module.exports = router;