const mongoose = require('mongoose'); 
const validator=require('validator')
const bcryptjs = require('bcryptjs')


var Coach = new mongoose.Schema({
   picture:{
    type:String,
   },
    name:{
        type:String,
        required:true,
        index:true,
    },
    mobile:{
        type:String,
    },
   
    nationality:{
        type:String,
        required:true,
    },
    card_Number:{
        type:String,
        required:true,
    },
    Admin:{
        type:Boolean,
        default:false
    },
    role:{
        type:String,
        enum:['coach']
    },
    email:{
        type:String,
        unique:true,
        trim:true,
        validate(valu){
            if(!validator.isEmail(valu)){
                throw new Error("Invalid email")
            }
        },
        default:"empty"
        
    },
    password:{
        type:String,
        trim:true,
        minlength:8,
        validate(value){
            const StrongPassword = new RegExp("^(?=.*[a-z])(?=.*[0-9])")
            if(!StrongPassword.test(value)){
              throw new Error(" Password must contain ' ^(?=.*[a-z])(?=.*[0-9]) ' ")
            }
          }
          
    },
    tokens:[
        {
            type:String,
            expiresIn:"10d"
        }
    ],
});


Coach.pre("save",async function(){

    try {
     const user = this 
        if(!user.isModified("password")){
        
          return
        }
            user.password =  bcryptjs.hash( user.password , 8)
      
      }
   catch (error) {
        console.log(error)
  } 
    
})     
    
     Coach.methods.toJSON = function(){
        const user = this 
        const dataToObject = user.toObject()
        delete dataToObject.password
        delete dataToObject.tokens
       
        return dataToObject
      }
    

module.exports = mongoose.model('Coach', Coach);
