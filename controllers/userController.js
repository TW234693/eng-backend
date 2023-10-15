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

const getUserById = async (req, res) => {
    const {id} = req.params
    if(!id){
        return res.status(400).json({
            message: "User ID must be provided."
        })
    }

    const user = await User.findById(id).select('-password').lean();
    if(!user){
        return res.status(400).json({message: `No user with ID ${id} was found.`})
    }
    return res.json({
        ...user
    });
}

const getUserClients = async (req, res) => {
    const {id} = req.params
    if(!id){
        return res.status(400).json({
            message: "User ID must be provided."
        })
    }

    const user = await User.findById(id).select('-password').lean();
    if(!user){
        return res.status(400).json({message: `No user with ID ${id} was found.`})
    }

    const clients = await Client.find({user: user._id}).select('-password').lean();
    console.log(clients)
    if(!clients || clients.length===0){
        return res.status(400).json({message: "This user has no clients"})
    }

    return res.status(200).json({clients})
}

const createUser = async (req, res) => {
    const {password, email, name, surname} = req.body;

    // Confirm data
    if(!password || !email || !name || !surname){
        return res.status(400).json({message: "All fields are required."});
    }

    //Check for duplicates
    const duplicate = await User.findOne({email}).lean().exec()
    if(duplicate){
        return res.status(409).json({messsage: "This email is already assigned to an existing user."})
    }

    try{
    const hashPassowrd = await bcrypt.hash(password, 10) //salt rounds
    const userObject = {
        email,
        password: hashPassowrd,
        name,
        surname
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
    const {id} = req.params;
    const {password, name, surname, email} = req.body;

    if(!id && !password && !name && !surname){
        return res.status(400).json({message: "The new password, surname, or name must be provided alongside user ID."})
    }
    if(email){
        return res.status(400).json({
            message: "The email address cannot be changed."
        })
    }

    const user = await User.findById(id).exec()
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

    const updatedUser = await user.save();
    return res.json({
        message: `User ${updatedUser.email} has been updated.`
    })
}

const deleteUser = async (req, res) => {
    const {id} = req.params

    if(!id){
        return res.status(400).json({message: "User ID Required."});
    }

    const user = await User.findById(id).exec();

    if(!user){
        return res.status(400).json({message: "User not found."})
    }

    const result = await user.deleteOne();

    const reply = `User ${result.email} with ID ${result._id} has been deleted.`

    return res.json({message: reply})
}

module.exports = {
    getAllUsers,
    getUserById,
    getUserClients,
    createUser,
    deleteUser,
    updateUser
}