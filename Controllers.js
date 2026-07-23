const recipe = require('./Model')


module.exports.getRecipes = async (req, res) => {
    try {
        const recipes = await recipe.find()
        res.status(200).send(recipes)
    } catch (err) {
        res.status(500).send({ error: "Ошибка при получении рецептов" })
    }
}

module.exports.saveRecipe = async (req, res) => {
    
    const { title, imgSource, category, ingredients, steps, keyWords } = req.body;
    
    recipe.create({ title, imgSource, category, ingredients, steps, keyWords })
        .then((data) => {
            console.log("Recipe added")
            res.status(201).send(data)
        })
        .catch(err => {
            console.log("Error occurred:", err.message)
            res.status(400).send({ error: err.message })
        })
}

module.exports.deleteRecipe = async (req, res) => {
    try {
        const { _id } = req.body;

        if (!_id) {
            return res.status(400).send('ID не указан в запросе');
        }

        const data = await recipe.findByIdAndDelete(_id);
        
        if (!data) {
            return res.status(404).send('Recipe not found');
        }
        
        res.send('Recipe deleted');
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).send({ error: "Ошибка при удалении" });
    }
};

module.exports.editRecipe = async (req, res) => {
    const { _id, title, imgSource, category, ingredients, steps, keyWords } = req.body;
    
    recipe.findByIdAndUpdate(_id, { title, imgSource, category, ingredients, steps, keyWords }, { returnDocument: 'after' })
        .then((data) => {
            if (!data) return res.status(404).send('Recipe not found')
            res.send(data)
        })
        .catch(err => {
            console.log("Error occurred")
            res.status(400).send({ error: err.message })
        })
}







// module.exports.editRecipe = async (req, res) => {
//     const { _id, title } = req.body;
//     recipe.findByIdAndUpdate (_id, {title})
//     .then(()=> res.send("Meal edited"))
//     .catch(err => console.log("Error occured"))
// }

