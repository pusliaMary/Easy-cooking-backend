const recipe = require('./model')


module.exports.getRecipes = async (req, res) => {
    try {
        const recipes = await recipe.find()
        res.status(200).send(recipes)
    } catch (err) {
        res.status(500).send({ error: "Ошибка при получении рецептов" })
    }
}

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
    const { _id, ...updateData } = req.body;
    
    recipe.findByIdAndUpdate(_id, updateData, { returnDocument: 'after', runValidators: true })
        .then((data) => {
            if (!data) return res.status(404).send('Recipe not found')
            res.send(data)
        })
        .catch(err => {
            console.log("Error occurred")
            res.status(400).send({ error: err.message })
    })
}




