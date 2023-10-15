const Client = require("../models/Clients")
const Meal = require("../models/Meals")
const User = require("../models/Users")
const bcrypt = require('bcrypt')

const getClientById = async (req, res) => {
    const {id} = req.params
    if(!id){
        return res.status(400).json({
            message: "Client ID must be provided."
        })
    }

    const client = await Client.findById(id).select('-password').lean();
    if(!client){
        return res.status(400).json({message: `No client with ID ${id} was found.`})
    }
    return res.json({
        ...client
    });
}

const getClientMeals = async (req, res) => {
    const {id} = req.params
    if(!id){
        return res.status(400).json({
            message: "Client ID must be provided."
        })
    }

    const client = await Client.findById(id).select('-password').lean();
    if(!client){
        return res.status(400).json({message: `No client with ID ${id} was found.`})
    }

    const clientMeals = await Meal.find({client: client._id}).lean()
    if(!clientMeals || clientMeals.length === 0){
        return res.status(400).json({
            message: "This client has no meals."
        })
    }

    return res.status(200).json(clientMeals)
}

const createClient = async (req, res) => {
    const {userId} = req.params;
    const {password, email, name, surname} = req.body;

    // Confirm data
    if(!password || !email || !name || !surname){
        return res.status(400).json({message: "All fields are required."});
    }

    if(!userId){
        return res.status(400).json({
            message: "User ID must be provided."
        })
    }

    const user = await User.findById(userId).select('-password').lean();
    if(!user){
        return res.status(400).json({message: `No user with ID ${userId} was found.`})
    }

    //Check for duplicates
    const duplicate = await Client.findOne({email}).lean().exec()
    if(duplicate){
        return res.status(409).json({messsage: "This email is already assigned to an existing client."})
    }

    try{
    const hashPassowrd = await bcrypt.hash(password, 10) //salt rounds
    const clientObject = {
        email,
        password: hashPassowrd,
        name,
        surname,
        user: userId
    }

    //Save new client
    await Client.create(clientObject)
    res.status(201).json({
        message: `New client ${email} was created!`
    })
    }
    catch(error){
        res.status(500).json({message: error.message})
    }

}

const updateClient = async (req, res) => {
    const {id} = req.params;
    const {password, name, surname, email} = req.body;

    if(email){
        return res.status(400).json({
            message: "The email address cannot be changed."
        })
    }
    if(!id && !password && !name && !surname){
        return res.status(400).json({message: "The new password, surname, or name must be provided alongside user ID."})
    }

    const client = await Client.findById(id).exec()
    if(!client){
        res.status(400).json({message: "Client not found."})
    }

    if(password){
        client.password = await bcrypt.hash(password, 10)
    }
    if(name){
        client.name = name
    }
    if(surname){
        client.surname = surname
    }

    const updatedUser = await client.save();
    return res.json({
        message: `Client ${updatedUser.email} has been updated.`
    })
}

const deleteClient = async (req, res) => {
    const {id} = req.params

    if(!id){
        return res.status(400).json({message: "Client ID Required."});
    }

    const client = await Client.findById(id).exec();

    if(!client){
        return res.status(400).json({message: "Client not found."})
    }

    const result = await client.deleteOne();

    const reply = `Client ${result.email} with ID ${result._id} has been deleted.`

    return res.json({message: reply})
}

module.exports = {
    getClientById,
    getClientMeals,
    createClient,
    updateClient,
    deleteClient,
}