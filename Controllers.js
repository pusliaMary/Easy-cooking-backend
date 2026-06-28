const model = require('./Model')

module.exports.getRecipes = async (req, res) => {
    const recipes = await model.find()
    res.send(recipes)
}

module.exports.saveRecipe = async (req, res) => {
    const { title } = req.body;
    Recipe.create({ title })
        .then((data) => {
            console.log("Recipe added")
            res.send(data)
        })
        .catch(err => console.log("Error occured"))
}

module.exports.deleteRecipe = async (req, res) => {
    const { _id } = req.query
    Recipe.findByIdAndDelete(_id)
    .then(()=> res.send('Recipe deleted'))
    .catch(err => console.log("Error occured"))
}

module.exports.editRecipe = async (req, res) => {
    const { _id, title } = req.body;
    Recipes.findByIdAndUpdate (_id, {title})
    .then(()=> res.send("Meal edited"))
    .catch(err => console.log("Error occured"))
}

