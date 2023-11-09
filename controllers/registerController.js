const User = require("../models/Users")
const Client = require("../models/Clients")
const bcrypt = require('bcrypt')

const createAccount = async (req, res) => {
    const {password, email, name, surname, description, isClient} = req.body;

    if(!password || !email || !name || !surname){
        return res.status(400).json({message: "Name, surname, email, and password are required."});
    }

    const duplicateUser = await User.findOne({email}).lean().exec()
    const duplicateClient = await Client.findOne({email}).lean().exec()
    if(duplicateUser || duplicateClient){
        return res.status(409).json({messsage: `Email ${email} is already assigned to an existing account.`})
    }

    try{
        const hashPassowrd = await bcrypt.hash(password, 10) //salt rounds
        const accountObject = {
            email,
            password: hashPassowrd,
            name,
            surname,
        }

        if(isClient){
            await Client.create(accountObject)
        }
        else{
            if(description){
                accountObject.description = description;
            }
            await User.create(accountObject)
        }

        res.status(201).json({
            message: `New account ${email} was created!`
        })
    }
    catch(error){
        res.status(500).json({message: error.message})
    }

}

module.exports = {
    createAccount
}