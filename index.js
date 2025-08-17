import express from 'express'
const app = express()
import cors from 'cors'


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

    // Update by document ID
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.params.id, 
      { $set: { 
          "description": description,
          "duration": duration, 
          "date": new Date(date).toDateString(),
        } 
      }, 
      { new: true }, // Return the updated document
      (err, updatedDoc) => {
        if (err) {
          console.error(err)
        } 
      }
    );

    res.json(updatedUser)

  }catch(err){
    console.error(err)
    res.status(500).json({error: 'An unexpected error occured'})
  }
})

// get user log
app.get('/api/users/:id/logs', (req,res)=>{
  try{
    const {username} = req.body
    console.log(username)

    res.json({_id:'1234', username: username})

  }catch(err){
    console.error(err)
    res.status(500).json({error: 'An unexpected error occured'})
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
