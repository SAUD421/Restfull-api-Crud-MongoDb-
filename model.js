const mongoose = require ('mongoose');

const itemSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    quantity:{
        type:Number,
        default:0
    }
},{timestamps:true});


module.exports = mongoose.model('Item', itemSchema);