const User = require("../models/Users")
const Client = require("../models/Clients")
const Meal = require("../models/Meals")
const ObjectId = require('mongoose').Types.ObjectId;

const getMealById = async (req, res) => {
    const {id} = req.params;
    if(!id){
        return res.status(400).json({
            message: "Meal ID must be provided"
        })
    }
    if(!ObjectId.isValid(id)){
        return res.status(400).json({
            message: `${id} isn't a valid ID.`
        })
    }

    const meal = await Meal.findById(id).lean()
    if(!meal){
        return res.status(400).json({message: `No meal with ID ${id} was found.`})
    }
    if(!meal.client){
        return res.status(500).json({
            message: `Meal ${meal.name} doesn't have a client assigned.`
        })
    }
    if(!ObjectId.isValid(meal.client)){
        return res.status(500).json({
            message: `${meal.client} isn't a valid meal client ID.`
        })
    }

    const mealClient = await Client.findById(meal.client).lean();
    if(!mealClient){
        return res.status(500).json({message: `The client who is assigned to the meal ${meal.name} couldn't be found`})
    }
    
    return res.status(200).json({
        ...meal
    });
}


const createMeal = async (req, res) => {
    const {clientEmail} = req.params;
    const {name, instructions, minutesCookingTime, mealDate, ingredients} = req.body;

    if(!name || !instructions || !minutesCookingTime || !mealDate || !ingredients){
        return res.status(400).json({message: "Meal name, cooking instructions, cooking time, ingredients, and time of the meal must be provided."});
    }

    const mealClient = await Client.findOne({email: clientEmail}).lean()
    if(!mealClient){
        return res.status(400).json({
            messsage: `Client with email ${clientEmail} was not found.`
        })
    }
    if(!mealClient.user){
        return res.status(400).json({
            message: `Client ${mealClient.email} doesn't have a user assigned.`
        })
    }
    if(!ObjectId.isValid(mealClient.user)){
        return res.status(500).json({
            message: `${mealClient.user} isn't a valid meal client user ID.`
        })
    }

    const mealClientUser = await User.findById(mealClient.user).lean()
    if(!mealClientUser){
        return res.status(500).json({
            message: `User to which the client ${mealClient.email} is assigned to doesn't exist.`
        })
    }
    if(req.user !== mealClientUser.email){
        return res.status(401).json({
            message: "Unauthorized"
        })
    }

    const newMeal = {
        name,
        instructions,
        ingredients,
        minutesCookingTime,
        mealDate,
        ingredients,
        client: mealClient._id
    }

    await Meal.create(newMeal)
    res.status(201).json({
        message: `Meal ${newMeal.name} was created!`
    })
}

const updateMeal = async (req, res) => {
    const {id} = req.params;
    const {name, instructions, minutesCookingTime, mealDate, ingredients} = req.body;

    if(!name && !instructions && !minutesCookingTime && !mealDate && !ingredients){
        return res.status(400).json({
            message: `New meal name, cooking instructions, time of cooking, ingredients, or time of meal must be provided.`
        })
    }

    if(!id){
        return res.status(400).json({
            message: "Meal ID must be provided"
        })
    }
    if(!ObjectId.isValid(id)){
        return res.status(400).json({
            message: `${id} isn't a valid ID.`
        })
    }

    const meal = await Meal.findById(id).exec();
    if(!meal){
        return res.status(400).json({
            message: `Meal with ID ${id} was not found.`
        })
    }
    if(!meal.client){
        return res.status(500).json({
            message: `Meal ${meal.name} doesn't have a client assigned.`
        })
    }
    if(!ObjectId.isValid(meal.client)){
        return res.status(500).json({
            message: `${meal.client} isn't a valid meal client ID.`
        })
    }

    const mealClient = await Client.findById(meal.client).exec();
    if(!mealClient){
        return res.status(500).json({
            message: `Couldn't find client ${mealClient.email} assigned to the meal ${meal.name}`
        })
    }
    if(!mealClient.user){
        return res.status(400).json({
            message: `Client ${mealClient.email} doesn't have a user assigned.`
        })
    }
    if(!ObjectId.isValid(mealClient.user)){
        return res.status(400).json({
            message: `${mealClient.user} isn't a valid meal client user ID.`
        })
    }

    const mealClientUser = await User.findById(mealClient.user).lean();
    if(!mealClientUser){
        return res.status(500).json({message: `The user to whom the client ${mealClient.email} is assigned coudln't be found`})
    }
    if(req.user !== mealClientUser.email){
        return res.status(401).json({
            message: "Unauthorized"
        })
    }

    if(name){
        meal.name = name
    }
    if(instructions){
        meal.instructions = instructions
    }
    if(minutesCookingTime){
        meal.minutesCookingTime = minutesCookingTime
    }
    if(mealDate){
        meal.mealDate = mealDate
    }
    if(ingredients){
        meal.ingredients = ingredients
    }

    const updatedMeal = await meal.save();
    return res.status(201).json({
        message: `Meal ${updatedMeal.name} has been updated.`
    })
}

const deleteMeal = async (req, res) => {
    const {id} = req.params

    if(!id){
        return res.status(400).json({message: "Meal ID required."});
    }
    if(!ObjectId.isValid(id)){
        return res.status(400).json({
            message: `${id} isn't a valid ID.`
        })
    }

    const meal = await Meal.findById(id).exec();
    if(!meal){
        return res.status(400).json({
            message: `Meal with ID ${id} wasn not found.`
        })
    }
    if(!meal.client){
        return res.status(400).json({
            message: `Meal ${meal.name} doesn't have a client assigned.`
        })
    }
    if(!ObjectId.isValid(meal.client)){
        return res.status(400).json({
            message: `${meal.client} isn't a valid meal client ID.`
        })
    }

    const mealClient = await Client.findById(meal.client).exec();
    if(!mealClient){
        return res.status(500).json({
            message: `Couldn't find client ${mealClient.email} assigned to the meal ${meal.name}`
        })
    }
    if(!mealClient.user){
        return res.status(400).json({
            message: `Client ${mealClient.email} doesn't have a user assigned.`
        })
    }
    if(!ObjectId.isValid(mealClient.user)){
        return res.status(400).json({
            message: `${mealClient.user} isn't a valid meal client user ID.`
        })
    }

    const mealClientUser = await User.findById(mealClient.user).lean();
    if(!mealClientUser){
        return res.status(500).json({message: `The user to whom the client ${mealClient.email} is assigned couldn't be found`})
    }
    if(req.user !== mealClientUser.email){
        return res.status(401).json({
            message: "Unauthorized"
        })
    }

    const result = await meal.deleteOne();

    return res.json({
        message: `Meal ${result.name} has been deleted.`
    })
}

module.exports = {
    getMealById,
    createMeal,
    updateMeal,
    deleteMeal,
}