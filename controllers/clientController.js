const Client = require("../models/Clients")
const Meal = require("../models/Meals")
const User = require("../models/Users")
const bcrypt = require('bcrypt')

const getClientByEmail = async (req, res) => {
    const {email} = req.params
    if(!email){
        return res.status(400).json({
            message: "Client email must be provided."
        })
    }

    const client = await Client.findOne({email: email}).select('-password').lean();
    if(!client){
        return res.status(400).json({message: `No client with email ${email} was found.`})
    }
    return res.json({
        ...client
    });
}

const getClientMeals = async (req, res) => {
    const {email} = req.params
    if(!email){
        return res.status(400).json({
            message: "Client email must be provided."
        })
    }

    const client = await Client.findOne({email: email}).select('-password').lean();
    if(!client){
        return res.status(400).json({message: `No client with email ${email} was found.`})
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
    const {password, email, name, surname} = req.body;

    // Confirm data
    if(!password || !email || !name || !surname){
        return res.status(400).json({message: "All fields are required."});
    }

    //Check for duplicates
    const duplicate = await Client.findOne({email}).lean().exec()
    if(duplicate){
        return res.status(409).json({messsage: `Email ${email} is already assigned to an existing client.`})
    }

    try{
    const hashPassowrd = await bcrypt.hash(password, 10) //salt rounds
    const clientObject = {
        email,
        password: hashPassowrd,
        name,
        surname
    }

    //Save new client
    await Client.create(clientObject)
    res.status(201).json({
        message: `New client ${clientObject.email} was created!`
    })
    }
    catch(error){
        res.status(500).json({message: error.message})
    }

}

const updateClient = async (req, res) => {
    const {email} = req.params;
    const {password, name, surname} = req.body;

    if(!email && !password && !name && !surname){
        return res.status(400).json({message: "The new password, surname, or name must be provided alongside client email."})
    }

    const client = await Client.findOne({email: email}).exec()
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
    const {email} = req.params

    if(!email){
        return res.status(400).json({message: "Client email required."});
    }

    const client = await Client.findOne({email: email}).exec();

    if(!client){
        return res.status(400).json({message: "Client not found."})
    }

    const result = await client.deleteOne();

    const reply = `Client ${result.email} with ID ${result._id} has been deleted.`

    return res.json({message: reply})
}

const unassignClient = async (req, res) => {
    const {email} = req.params

    if(!email){
        return res.status(400).json({message: "Client email required."});
    }

    const client = await Client.findOne({email: email}).exec();

    if(!client){
        return res.status(400).json({message: "Client not found."})
    }

    client.user = undefined;
    const unassignedClient = await client.save();

    return res.json({
        message: `Client ${unassignedClient.email} has been unassigned and can now be assigned to a different user.`
    })
}

module.exports = {
    getClientByEmail,
    getClientMeals,
    createClient,
    updateClient,
    deleteClient,
    unassignClient
}