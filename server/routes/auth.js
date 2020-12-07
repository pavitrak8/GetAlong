const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model("User")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const{JWT_SECRET} = require('../keys')
const requireLogin = require('../middleware/requireLogin')

router.post('/signup',(req,res)=>{
    const{name,email,password,pic} = req.body
    if(!name || !email || !password){
        return res.status(422).json({error:"Please fill all the fields"})
    }
    User.findOne({email:email})
    .then((savedUser)=>{
        if(savedUser){
            return res.status(422).json({error:"User already exists with this Email"})
        }
        User.findOne({name:name})
        .then((savedUser)=>{
            if(savedUser){
                return res.status(422).json({error:"User already exists with this Username"})
            }
            bcrypt.hash(password,12)
            .then(hashedpassword=>{
                const user = new User({
                    email,
                    password:hashedpassword,
                    name,
                    pic
                })
                
                user.save()
                .then(user=>{
                    res.json({message:"Saved Successfully"})
                })
                .catch(err=>{
                    console.log(err)
                })
            })
            
        })
        .catch(err=>{
            console.log(err)
        })
    })
    .catch(err=>{
        console.log(err)
    })
})

router.post('/signin',(req,res)=>{
    const{name,password}=req.body
    if(!name || !password){
        return res.status(422).json({error:"Please add all the fields"})
    }
    User.findOne({name:name})
    .then(savedUser=>{
        if(!savedUser){
            return res.status(422).json({error:"Invalid Name or Password"})
        }
        bcrypt.compare(password,savedUser.password)
        .then(doMatch=>{
            if(doMatch){
                //res.json({message:"Signed in Successfully"})
                const token = jwt.sign({_id:savedUser._id},JWT_SECRET)
                const{_id,name,email,followers,following,pic}=savedUser
                res.json({token,user:{_id,name,email,followers,following,pic}})
            }
            else{
                return res.status(422).json({error:"Invalid Name or Password"})
            }
        })
        .catch(err=>{
            console.log(err)
        })
    })
})

module.exports = router