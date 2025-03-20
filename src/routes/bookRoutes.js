import express from 'express'
import cloudinary from '../lib/cloudinary.js'
import Book from '../models/Book.js'
import { protectRoute } from '../middleware/middleware.js'

const router = express.Router()

router.post("/",protectRoute,async(req,res)=>{
    const {title,caption,rating,image} = req.body

    
    try {
        if(!image || !title || !caption || !rating) return res.status(400).json({message:"Please provide an fields"})
//cloadinary
        const uploadResponse = await cloudinary.uploader.upload(image)
        const imageUrl = uploadResponse.secure_url
//save
        const newBook = new Book({
            title,
            caption,
            rating,
            image:imageUrl,
            user:req.user._id
        })

        await newBook.save()

        res.status(201).json(newBook)
        
    } catch (error) {
        
    }
})
//pagination => infinite scroll
router.get("/",protectRoute,async(req,res)=>{
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 5
        const skip = (page-1) * limit

        const books = await Book.find().sort({createdAt:-1}).skip(skip).limit(limit).populate("user","username profileImage")

        const totalBooks = await Book.countDocuments()
        res.send({
            books,
            currentPage:page,
            totalBooks,
            totalPages:Math.ceil(totalBooks/limit)
        })
    } catch (error) {
        console.log(error)
    }
})
//get recommended books by the logged in user
router.get("/user",protectRoute,async(req,res)=>{
    try {
        const books = await Book.find({
            user:req.user._id
        }).sort({createdAt:-1})
        res.send(books)
    } catch (error) {
        console.log(error)
    }
})

router.delete("/:id",protectRoute,async(req,res)=>{
    try {
        const book = await Book.findById(req.params.id)
        if(!book) return res.status(404).json({message:"Book not found"})

        if(book.user.toString() !== req.user._id()) return res.status(401).json({message:"Unothorized"})

        if(book.image && book.image.includes("cloudinary")){
            try {
                const publicId = book.image.split("/").pop().split(".")[0]
                await cloudinary.uploader.destroy(publicId)
            } catch (error) {
                console.log(error)
            }
        }

        await book.deleteOne()
        res.json({message:"book deleted!"})
    } catch (error) {
        console.log(error)
        
    }
})
export default router