const User = require("../models/Users")
const Client = require("../models/Clients")
const Meal = require("../models/Meals")
const bcrypt = require('bcrypt')

const getMealById = async (req, res) => {
    const {id} = req.params;
    if(!id){
        return res.status(400).json({
            message: "Meal ID must be provided"
        })
    }
    try{
        const meal = await Meal.findById(id).lean()
        if(!meal){
            return res.status(400).json({message: `No meal with ID ${id} was found.`})
        }

        return res.status(200).json({
            ...meal
        });
    }
    catch(error){
        return res.status(400).json({message: `No meal with ID ${id} was found.`})
    }
}


const createMeal = async (req, res) => {
    const {clientEmail} = req.params;
    const {name, instructions, minutesCookingTime, mealDate, ingredients} = req.body;

    if(!name || !instructions || !minutesCookingTime || !mealDate || !ingredients){
        return res.status(400).json({message: "Meal name, cooking instructions, cooking time, ingredients, and time of the meal must be provided."});
    }

    const client = await Client.findOne({email: clientEmail}).lean()
    if(!client){
        return res.status(409).json({messsage: `Client with email ${clientEmail} was not found.`})
    }

    const newMeal = {
        name,
        instructions,
        ingredients,
        minutesCookingTime,
        mealDate,
        ingredients,
        client: client._id
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

    let meal;
    try{
        meal = await Meal.findById(id).exec();
        if(!meal){
            return res.status(400).json({
                message: `Meal with ID ${id} wasn not found.`
            })
        }
    }
    catch(error){
        return res.status(400).json({message: `No meal with ID ${id} was found.`})
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

    let meal;
    try{
        meal = await Meal.findById(id).exec();
        if(!meal){
            return res.status(400).json({
                message: `Meal with ID ${id} wasn not found.`
            })
        }
    }
    catch(error){
        return res.status(400).json({message: `No meal with ID ${id} was found.`})
    }

    if(!meal){
        return res.status(400).json({
            message: `Meal with ID ${id} not found.`
        })
    }

    const result = await meal.deleteOne();

    const reply = `Meal ${result.name} has been deleted.`

    return res.json({message: reply})
}

module.exports = {
    getMealById,
    createMeal,
    updateMeal,
    deleteMeal,
}