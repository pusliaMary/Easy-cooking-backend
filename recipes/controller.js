import recipe from './model.js';
import mongoose from 'mongoose'; 
import { saveFile, deleteFile, getPublicIdFromUrl } from '../file/upload.js';

export const getRecipes = async (req, res) => {
    try {
        const recipes = await recipe.find();
        res.status(200).send(recipes);
    } catch (err) {
        res.status(500).send({ error: "Ошибка при получении рецептов" });
    }
};

export const getRecipeById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ error: "Некорректный формат ID рецепта" });
        }
        const foundRecipe = await recipe.findById(id);
        if (!foundRecipe) {
            return res.status(404).send({ error: "Рецепт с указанным ID не найден" });
        }
        res.status(200).send(foundRecipe);
    } catch (err) {
        console.error("Error getting recipe by id:", err.message);
        res.status(500).send({ error: "Ошибка при получении данных рецепта" });
    }
};

export const saveRecipe = async (req, res) => {
    try {
        const recipeData = { ...req.body };

        if (typeof recipeData.ingredients === 'string') recipeData.ingredients = JSON.parse(recipeData.ingredients);
        if (typeof recipeData.steps === 'string') recipeData.steps = JSON.parse(recipeData.steps);
        if (typeof recipeData.keyWords === 'string') recipeData.keyWords = JSON.parse(recipeData.keyWords);
        if (typeof recipeData.whatProtein === 'string') recipeData.whatProtein = JSON.parse(recipeData.whatProtein);

        const imageFile = req.files?.find(file => file.fieldname === 'uploadImage' || file.fieldname === 'image');
        
        if (imageFile) {
            recipeData.imgSource = await saveFile(imageFile);
        }

        const data = await recipe.create(recipeData);
        console.log("Recipe added directly with Cloudinary image");
        res.status(201).send(data);
    } catch (err) {
        console.log("Error occurred during creation:", err.message);
        res.status(400).send({ error: err.message });
    }
};

export const editRecipe = async (req, res) => {
    try {
        const { id } = req.params; 
        const updateData = { ...req.body };
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ error: 'Некорректный формат ID рецепта' });
        }

        if (typeof updateData.ingredients === 'string') updateData.ingredients = JSON.parse(updateData.ingredients);
        if (typeof updateData.steps === 'string') updateData.steps = JSON.parse(updateData.steps);
        if (typeof updateData.keyWords === 'string') updateData.keyWords = JSON.parse(updateData.keyWords);
        if (typeof updateData.whatProtein === 'string') updateData.whatProtein = JSON.parse(updateData.whatProtein);

        const existingRecipe = await recipe.findById(id);
        if (!existingRecipe) {
            return res.status(404).send({ error: 'Recipe not found' });
        }

        const newImageFile = req.files?.find(file => file.fieldname === 'uploadImage' || file.fieldname === 'image');
        
        if (newImageFile) {
            if (existingRecipe.imgSource) {
                const oldPublicId = getPublicIdFromUrl(existingRecipe.imgSource);
                if (oldPublicId) await deleteFile(oldPublicId);
            }
            updateData.imgSource = await saveFile(newImageFile);
        }

        const updatedData = await recipe.findByIdAndUpdate(
            id, 
            updateData, 
            { returnDocument: 'after', runValidators: true }
        );

        res.status(200).send(updatedData);
    } catch (err) {
        console.log("Error occurred during update:", err.message);
        res.status(400).send({ error: err.message });
    }
};

export const deleteRecipe = async (req, res, next) => {
    try {
        const { id } = req.params; 

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400);
            throw new Error('Передан некорректный формат ID (Invalid ObjectId)');
        }

        const foundRecipe = await recipe.findById(id);
        if (!foundRecipe) {
            res.status(404);
            throw new Error('Рецепт с указанным ID не найден в базе данных');
        }

        if (foundRecipe.imgSource) {
            const publicId = getPublicIdFromUrl(foundRecipe.imgSource);
            if (publicId) {
                await deleteFile(publicId);
            }
        }

        await recipe.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: 'Recipe and its cloud image successfully deleted' });

    } catch (err) {
        next(err); 
    }
};
