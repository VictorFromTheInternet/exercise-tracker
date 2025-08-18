import express from 'express'
const app = express()
import cors from 'cors'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import connectDb from './config/connectDb.js'
import UserModel from './models/user_model.js'


connectDb()

app.use(express.json())
app.use(express.urlencoded())
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//
// routes
//
// get all
app.get('/api/users', async (req,res)=>{
  try{
    const users = await UserModel.find()
    if(!users){
      res.status(400).json({"message": "no users found"})
      return
    }

    res.json(users)

  }catch(err){
    console.error(err)
    res.status(500).json({error: 'An unexpected error occured'})
  }
})

//create user
app.post('/api/users', async (req,res)=>{
  try{
    const {username} = req.body    

    // check if already exists
    const existingUser = await UserModel.findOne({"username":username})
    if(existingUser){
      res.status(200).json({"_id": existingUser._id, "username": existingUser.username})
      return
    }

    // create user
    const newUser = new UserModel({
      "username": username
    })
    await newUser.save()

    res.json({"_id":newUser._id, "username": newUser.username})

  }catch(err){
    console.error(err)
    res.status(500).json({error: 'An unexpected error occured'})
  }
})

// add exercise for user
app.post('/api/users/:id/exercises', async (req,res)=>{
  try{
    const {description, duration, date} = req.body  
    let formattedDate = (date)? new Date(date).toDateString() : new Date().toDateString()
    if(formattedDate === 'Invalid Date'){
      res.json({error: 'Invalid Date'})
      return
    }    
    console.log(formattedDate)

    // Update by document ID
    const newExercise = {
      "description": description,
      "duration": duration, 
      "date": formattedDate,
    }
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.params.id, 
      { $push: {    
          "log": newExercise
        } 
      }, 
      { new: true } // Return the updated document      
    );    

    res.json({      
      username: updatedUser.username,
      description: newExercise.description,
      duration: Number.parseInt(newExercise.duration),
      date: newExercise.date,
      _id: updatedUser._id,
    })

  }catch(err){
    console.error(err)
    res.status(500).json({error: 'An unexpected error occured'})
  }
})

// get user log
app.get('/api/users/:id/logs', async (req,res)=>{
  try{
    const user = await UserModel.findOne({_id: req.params.id})
    if(!user){
      res.json({message:"Could not find user"})
    }
    
    let logs = user.log
    const {from, to, limit} = req.query
    if(from) {
      const fromDate = new Date(from)
      logs = logs.filter((elm)=> new Date(elm.date) >= fromDate)
    }
    if(to) {
      const toDate = new Date(to)
      logs = logs.filter((elm)=> new Date(elm.date) <= toDate)
    }
    if(limit) {
      logs = logs.slice(0,parseInt(limit))
    }

    res.json({
      "username": user.username,      
      "count": user.log.length,
      "log": logs,
      "_id": user._id,      
    })

  }catch(err){
    console.error(err)
    res.status(500).json({error: 'An unexpected error occured'})
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
