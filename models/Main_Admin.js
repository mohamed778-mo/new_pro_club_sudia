const mongoose = require('mongoose')
const validator=require('validator')
const bcryptjs = require('bcryptjs')


var  MainAdminSchema = new mongoose.Schema({
    FirstName:{
        type:String,
        trim:true,
        
    },
    LastName:{
        type:String,
        trim:true,
        
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        validate(valu){
            if(!validator.isEmail(valu)){
                throw new Error("Invalid email")
            }
        }
    },
   
    mobile:{
        type:String,
        trim:true,
    },
    password:{
        type:String,
        required:true,
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
    Admin:{
        type:Boolean,
        default:true
    },
    role:{
        type:String,
        enum:['admin']
    },
}
,
{
 timestamps:true
}
);

MainAdminSchema.pre("save",async function(){

    try {
     const user = this 
        if(!user.isModified("password")){
        
          return
        }
            user.password = await bcryptjs.hash( user.password , 8)
      
      }
   catch (error) {
        console.log(error)
  } 
     })     
    
     MainAdminSchema.methods.toJSON = function(){
        const user = this 
        const dataToObject = user.toObject()
        delete dataToObject.password
        delete dataToObject.tokens
       
        return dataToObject
      }
      


module.exports = mongoose.model('Main_Admin', MainAdminSchema);