const mongoose = require('mongoose'); // Erase if already required


var Player = new mongoose.Schema({
   picture:{
    type:String,
   },
    name:{
        type:String,
        required:true,
        index:true,
    },
    coach:{
        type:String,
    },
    mobile:{
        type:String,
        required:true,
       unique:false
        
    },
    dateOfBirth:{
        type:String,
        required:true,
    },
    nationality:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    card_Number:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:['player']
    },
 doc_start:{
        type:String,
       
    },
   doc_end:{
        type:String,
    },

  attendance: {
        present: {
            type: Number,
            default: 0,
        },
        absent: {
            type: Number,
            default: 0,
        },
    }

   
});



module.exports = mongoose.model('Player', Player);
