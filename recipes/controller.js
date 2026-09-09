const recipe = require('./model')
const mongoose = require("mongoose"); 

module.exports.getRecipes = async (req, res) => {
    try {
        const recipes = await recipe.find()
        res.status(200).send(recipes)
    } catch (err) {
        res.status(500).send({ error: "Ошибка при получении рецептов" })
    }
}

module.exports.getRecipeById = async (req, res) => {
    try {
        const { id } = req.params;

        const mongoose = require("mongoose");
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

module.exports.saveRecipe = async (req, res) => {
    recipe.create(req.body) 
        .then((data) => {
            console.log("Recipe added")
            res.status(201).send(data)
        })
        .catch(err => {
            console.log("Error occurred:", err.message)
            res.status(400).send({ error: err.message })
        })
}

module.exports.deleteRecipe = async (req, res, next) => {
    try {
        const { id } = req.params; 

        if (!id) {
            res.status(400);
            throw new Error('ID рецепта не указан в параметрах URL запроса');
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400);
            throw new Error('Передан некорректный формат ID (Invalid ObjectId)');
        }

        const data = await recipe.findByIdAndDelete(id);
        
        if (!data) {
            res.status(404);
            throw new Error('Рецепт с указанным ID не найден в базе данных');
        }
        
        return res.status(200).json({ success: true, message: 'Recipe deleted' });

    } catch (err) {
        next(err); 
    }
};

module.exports.editRecipe = async (req, res) => {
    
    const { id } = req.params; 
    const updateData = req.body;
    
    
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({ error: 'Некорректный формат ID рецепта' });
    }
    
    recipe.findByIdAndUpdate(id, updateData, { returnDocument: 'after', runValidators: true })
        .then((data) => {
            if (!data) return res.status(404).send('Recipe not found')
            res.send(data)
        })
        .catch(err => {
            console.log("Error occurred during update:", err.message)
            res.status(400).send({ error: err.message })
    })
}





