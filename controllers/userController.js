const User = require("../models/Users")
const Client = require("../models/Clients")
const bcrypt = require('bcrypt')

const getAllUsers = async (_, res) => {
    const users = await User.find().select('-password').lean();
    if(!users || users.length<=0){
        return res.status(400).json({message: "No users found."})
    }
    return res.json(users);
}

const searchUsers = async (req, res) => {
    const {query} = req.params
    const regex = new RegExp(query, 'i');
    
    const users = await User.find({
        $or:[
            {name: {$regex: regex}},
            {email: {$regex: regex}},
            {surname: {$regex: regex}},
            {description: {$regex: regex}},
            ]
        })
        .select('-password')
        .lean();
        
    if(!users || users.length<=0){
        return res.status(400).json({message: "No users found."})
    }
    return res.json(users);
}

const getUserByEmail = async (req, res) => {
    const {email} = req.params
    if(!email){
        return res.status(400).json({
            message: "User email must be provided."
        })
    }

    const user = await User.findOne({email: email}).select('-password').lean();
    if(!user){
        return res.status(400).json({message: `No user with email ${email} was found.`})
    }
    return res.json({
        ...user
    });
}

const getUserClients = async (req, res) => {
    const {email} = req.params
    if(!email){
        return res.status(400).json({
            message: "User email must be provided."
        })
    }

    const user = await User.findOne({email: email}).select('-password').lean();
    if(!user){
        return res.status(400).json({message: `No user with email ${email} was found.`})
    }

    const clients = await Client.find({user: user._id}).select('-password').lean();
    if(!clients || clients.length===0){
        return res.status(400).json({message: "This user has no clients"})
    }

    return res.status(200).json({clients})
}

const assignClient = async (req, res) => {
    const {userEmail, clientEmail} = req.body
    if(!userEmail){
        return res.status(400).json({
            message: "User email must be provided."
        })
    }

    const user = await User.findOne({email: userEmail}).select('-password').lean().exec();
    if(!user){
        return res.status(400).json({message: `No user with email ${userEmail} was found.`})
    }

    const client = await Client.findOne({email: clientEmail}).select('-password').exec();
    if(!client){
        return res.status(400).json({message: `No client with email ${clientEmail} was found.`})
    }

    if(client.user && user._id.equals(client.user._id)){
        return res.status(400).json({message: `User ${userEmail} is already assigned to client ${clientEmail}.`})
    }
    if(client.user){
        return res.status(400).json({message: `Client ${clientEmail} is already assigned to a different user and must unassign themself first before being assigned elsewhere.`})
    }

    client.user = user._id
    const updatedClient = await client.save();
    return res.status(201).json({
        message: `Client ${updatedClient.email} has been assigned.`
    })
}

const createUser = async (req, res) => {
    const {password, email, name, surname, description} = req.body;

    // Confirm data
    if(!password || !email || !name || !surname || !description){
        return res.status(400).json({message: "All fields are required."});
    }

    //Check for duplicates
    const duplicate = await User.findOne({email}).lean().exec()
    if(duplicate){
        return res.status(409).json({messsage: `Email ${email} is already assigned to an existing user.`})
    }

    try{
    const hashPassowrd = await bcrypt.hash(password, 10) //salt rounds
    const userObject = {
        email,
        password: hashPassowrd,
        name,
        surname,
        description,
        rating: 0.0,
        ratingsCount: 0,
    }

    //Save new user
    await User.create(userObject)
    res.status(201).json({
        message: `New user ${email} was created!`
    })
    }
    catch(error){
        res.status(500).json({message: error.message})
    }

}

const updateUser = async (req, res) => {
    const {email} = req.params;
    const {password, name, surname, description} = req.body;

    if(!email && !password && !name && !surname){
        return res.status(400).json({message: "The new password, surname, or name must be provided alongside user email."})
    }

    const user = await User.findOne({email: email}).exec()
    if(!user){
        res.status(400).json({message: "User not found."})
    }

    if(password){
        user.password = await bcrypt.hash(password, 10)
    }
    if(name){
        user.name = name
    }
    if(surname){
        user.surname = surname
    }
    if(description){
        user.description = description
    }

    const updatedUser = await user.save();
    return res.json({
        message: `User ${updatedUser.email} has been updated.`
    })
}

const updateClientNotes = async (req, res) => {
    const {userEmail, clientEmail} = req.params
    const {notes} = req.body

    if(!userEmail || !clientEmail){
        return res.status(400).json({
            message: "User email and client emails must be provided"
        })
    }

    const user = await User.findOne({email: userEmail}).exec()
    if(!user){
        res.status(400).json({message: "User not found."})
    }

    const client = await Client.findOne({email: clientEmail}).exec()
    if(!client){
        res.status(400).json({message: "User not found."})
    }

    if(!client.user._id.equals(user._id)){
        return res.status(400).json({message: `Client ${clientEmail} is not assigned to user ${userEmail}`})
    }

    client.notes = notes;
    const updatedClient = await client.save();
    return res.json({
        message: `Client ${updatedClient.email}'s notes have been updated.`
    })
}

const deleteUser = async (req, res) => {
    const {email} = req.params

    if(!email){
        return res.status(400).json({message: "User email required."});
    }

    const user = await User.findOne({email: email}).exec();

    if(!user){
        return res.status(400).json({message: "User not found."})
    }

    const result = await user.deleteOne();

    const reply = `User with email ${result.email} has been deleted.`

    return res.json({message: reply})
}

module.exports = {
    getAllUsers,
    getUserByEmail,
    searchUsers,
    getUserClients,
    assignClient,
    createUser,
    deleteUser,
    updateUser,
    updateClientNotes
}