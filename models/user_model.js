import mongoose from 'mongoose'
const {Schema, model} = mongoose


export const logSchema = new Schema({
    description: {type: String, required: true},     
    duration: {type: Number, required: true},
    date: {type: String, required: true},
})

export const userSchema = new Schema({
    username: {type: String, required: true, unique: true},     
    log: {type: [logSchema]},
})


export default model('Users', userSchema)