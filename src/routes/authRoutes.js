import express from "express"
import User from "../models/User.js"
import jwt from "jsonwebtoken"

const router = express.Router()

const generateToken = (userId) =>{
    
    return jwt.sign({
        userId,
    },process.env.JWT_SECRET,{expiresIn:"15d"})
}

router.post("/register",async(req,res)=>{
    const {email,username,password} = req.body
    
    try {

        if(!username || !email || !password){
            return res.send(400).json({message:"All fields are required"})
        }
        if(password.length < 6) {
            return res.status(400).json({message:"Password should be at least 6 characters long"})
        }
        if(username.length < 3 ) {
            return res.status(400).json({message:"Username should be at least 3 characters long"})
            
        }
        const existingEmail = await User.findOne({email})
        if(existingEmail) return res.status(400).json({message:"Email already exists"})
        const existingUsername = await User.findOne({email})
        if(existingUsername) return res.status(400).json({message:"Email already exists"})

            const profileImage = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${username}`

        const user = new User({
            email,
            username,
            password,
            profileImage
        })
        await user.save()
        const token = generateToken(user._id)

        res.status(201).json({token,user:{
            _id:user._id,
            username:user.username,
            email:user.email,
            profileImage:user.profileImage
        }} )
    } catch (error) {
        console.log(error)
    }
})
router.post("/login",async(req,res)=>{
    const{email,password} = req.body
    try {
        if(!email || !password ) return res.status(400).jeson({message:"All fileds are required"})
            
        const user = await User.findOne({email})
        if(!user) return res.status(400).json({message:"User does not exist"})

        const isPasswordCorrect = await user.comparePassword(password)
        if(!isPasswordCorrect) return res.status(400).json({message:"Invalid credentials"})

        const token = generateToken(user._id)

        res.status(201).json({token,user:{
            _id:user._id,
            username:user.username,
            email:user.email,
            profileImage:user.profileImage
        }} )

            
    } catch (error) {
        console.log(error)
    }
})

export default router