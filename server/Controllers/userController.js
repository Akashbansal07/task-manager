const express = require("express");
 const UserModel = require("../models/userModel")
const expressAsyncHandler = require("express-async-handler");
const generateToken = require("../Config/generateToken");

const loginController = expressAsyncHandler(async (req, res) => {

    const { name, password } = req.body;

    const user = await UserModel.findOne({ name });



    if (user && (await user.matchPassword(password))) {
        const response = ({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id)
        });
        console.log(response);
        res.json(response);
    } else {
        throw new Error("Invalid userName or Password")
    }
});

const registerController = expressAsyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Log incoming request body for debugging
    console.log("Request Body: ", req.body);

    // Check for all fields
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All input fields are necessary" });
    }

    // Pre-existing user
    const userExist = await UserModel.findOne({ email });
    if (userExist) {
        return res.status(400).json({ message: "User already Exists" });
    }

    // Username already taken
    const userNameExist = await UserModel.findOne({ name });
    if (userNameExist) {
        return res.status(400).json({ message: "UserName already Exists, please change" });
    }

    // Create a new user entry in DB
    const user = await UserModel.create({ name, email, password });
    if (user) {
        return res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } else {
        return res.status(400).json({ message: "Registration Error" });
    }
});




module.exports = { loginController, registerController};