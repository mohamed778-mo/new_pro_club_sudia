const Player = require("../models/player")
const Coach = require("../models/coach")
const Main_Admin = require("../models/Main_Admin")


const bcryptjs = require('bcryptjs')
const jwt=require("jsonwebtoken")
const  mongoose  = require('mongoose')

const admin = require("firebase-admin");
const fs = require("fs");
require("dotenv").config();

const serviceAccount =JSON.parse(process.env.SERVER)

const create_mainadmin = async(req,res)=>{
    try {
        const { FirstName, LastName,email, mobile, password }= req.body
        const dublicatedEmail = await Main_Admin.findOne({ email: email });
        if (dublicatedEmail) {
          return res.status(400).send("Email already exist!!");
        }
       
        const newUser = new Main_Admin({FirstName, LastName,email, mobile, password,role:'admin'})
        await newUser.save() 
    
       res.status(200).send(newUser)
    
    } catch (error) {res.status(500).send(error.message)}
}

const create_player = async(req,res)=>{
    try {
        const {name ,coach ,mobile ,dateOfBirth ,nationality ,category ,card_Number}= req.body
      
        const file = req.files.find(f => f.fieldname === 'file')

        if(file){
        
            if (!file) {
              return res.status(400).send('No file uploaded.');
            }
          
               if (!admin.apps.length) {
                admin.initializeApp({
                  credential: admin.credential.cert(serviceAccount),
                  storageBucket: process.env.STORAGE_BUCKET
                });
              }
    
              const bucket = admin.storage().bucket();
              const blob = bucket.file(file.filename);
              const blobStream = blob.createWriteStream({
                metadata: {
                  contentType: file.mimetype
                }
              });
    
    
              await new Promise((reject) => {
                blobStream.on('error', (err) => {
                 return reject(err);
                });
    
                blobStream.on('finish', async () => {
                  try {
                    await blob.makePublic();
                    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                    fs.unlinkSync(file.path);
                    const newPlayer = new Player({
                      name,
                      picture: publicUrl ,
                      coach ,
                      mobile ,
                      role:'player'
                      ,dateOfBirth 
                      ,nationality
                       ,category 
                       ,card_Number
                    })
                   
                    newPlayer.save()
                   res.status(200).send(newPlayer)
                  } catch (err) {
                    reject(err);
                  }
                });
    
                fs.createReadStream(file.path).pipe(blobStream);
              });
          
      
          }
          
        if(!file){
        
        const newPlayer = new Player({
            name,
            picture: 'empty' ,
            coach ,
            mobile ,
            role:'player'
            ,dateOfBirth 
            ,nationality
             ,category 
             ,card_Number
          });
         await newPlayer.save();

           res.status(200).send(newPlayer)
          
          }
    
    } catch (error) {res.status(500).send(error.message)}
}

const create_coach = async(req,res)=>{
    try {
  
      const user = req.user
      console.log(user.Admin)
      if(user.Admin){
        const {name ,email,password ,mobile ,nationality ,card_Number}= req.body
       
        
       if(req.body.email ){
        const dublicatedEmail = await Coach.findOne({ email: email });
        if (dublicatedEmail) {
          return res.status(400).send("Email already exist!!");
        }
}


          const hashedPassword = await bcryptjs.hash(password, 10);
const file = req.files.find(f => f.fieldname === 'file')

if(file){
    
      if (!file) {
        return res.status(400).send('No file uploaded.');
      }
    
         if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: process.env.STORAGE_BUCKET
          });
        }

        const bucket = admin.storage().bucket();
        const blob = bucket.file(file.filename);
      
        const blobStream = blob.createWriteStream({
          metadata: {
            contentType: file.mimetype
          }
        });


        await new Promise((reject) => {
          blobStream.on('error', (err) => {
           return reject(err);
          });

          blobStream.on("finish", async () => {
            try {
              await blob.makePublic();
              const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
              fs.unlinkSync(file.path);
              const newCoach = new Coach({
                name,
                picture: publicUrl,
                role: 'coach',
                mobile,
                email,
                password:hashedPassword,  
                nationality,
                card_Number
              });
           
              newCoach.save()
              console.log(newCoach)
                 res.status(200).send(newCoach)
                  } catch (err) {
                    reject(err);
                  }
                });
    
                fs.createReadStream(file.path).pipe(blobStream);
              });
          
      
          }
          
        if(!file){
        
            const newCoach = new Coach({
                name,
                picture: 'empty' ,
                role:'coach',
                mobile,
                email,
                password:hashedPassword
                ,nationality
                ,card_Number
              });
              await  newCoach.save() 

                res.status(200).send(newCoach)
          
          }


   } 
  } catch (error) {res.status(500).send(error.message)}
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await Main_Admin.findOne({ email: email });
    let userType = 'admin';

    if (!user) {
     const  user_2 = await Coach.findOne({ email: email });
      userType = 'coach';
    

    if (!user_2) {
      return res.status(404).send("الايميل او الباسورد ليسوا صحيحين");
    }
}
    const isPassword = await bcryptjs.compare(password, user.password);
    if (!isPassword) {
      return res.status(404).send("الايميل او الباسورد ليسوا صحيحين");
    }

    const SECRETKEY = process.env.SECRETKEY;
    const token = jwt.sign({ id: user._id }, SECRETKEY);
    const expiresIn = userType === 'admin' ? 60 * 60 * 24 * 1024 * 300 : 60 * 24 * 1024;
    res.cookie("access_token", `Bearer ${token}`, {
      expires: new Date(Date.now() + expiresIn),
      httpOnly: true,
    });

    user.tokens = user.tokens || [];
    user.tokens.push(token);
    await user.save();

    res.status(200).send({
      access_token: `Bearer ${token}`,
      success: userType === 'admin' ? "تم التسجيل بنجاح, مرحبا ادمن" : "تم التسجيل بنجاح, مرحبا كابتن"
    });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

  const getAllPlayer = async (req, res) => {
    try {
    const user = req.user
    if(user.Admin){
    const getAllPlayer = await Player.find();
    res.status(200).json(getAllPlayer);
}else{ 
    res.status(400).send("لست ادمن ");
}
    } catch (e) {
      res.status(500).send(e.message);
    }
  };

  const getAllCoach = async (req, res) => {
    try {
    const user = req.user
    if(user.Admin){
    const getAllCoach = await Coach.find();
    res.status(200).json(getAllCoach);
}else{ 
    res.status(400).send("لست ادمن ");
}
    } catch (e) {
      res.status(500).send(e.message);
    }
  };

  const get_coach_Player = async (req, res) => {
    try {
      const user = req.user

    
    if(user.Admin){
    const get_coach_Player = await Player.find({coach:user.name});
    res.status(200).json(get_coach_Player);
}else{ 
    res.status(400).send("لست الكابتن ");
}

    } catch (e) {
      res.status(500).send(e.message);
    }
  };

  const loginOut = async (req, res) => {
    try {
      req.user.tokens = [];
      res
        .clearCookie("access_token", { sameSite: "none", secure: true })
        .status(200)
        .send("login out is success.");
    } catch (e) {
      res.status(500).send(e.message);
    }
  };


  const getPlayer = async (req, res) => {
    try {
        
      const player_id = req.params.player_id
      const player = await Player.findById(player_id);
      if (!player) {
        return res.status(404).send(" id not exist ! ");
      }
  
      res.status(200).send(player);
    } catch (e) {
      res.status(500).send(e.message);
    }
  };
  const getCoach = async (req, res) => {
    try {
      const user = req.user
      if(user.Admin){
      const coach_id = req.params.coach_id
      const data = await Coach.findById(coach_id);
      if (!data) {
        return res.status(404).send(" id not exist ! ");
      }
  
      res.status(200).send(data);
    }else{res.status(400).send("لست ادمن")}
    } catch (e) {
      res.status(500).send(e.message);
    }
  };

  const accessAdmin = async (req, res) => {
    try {
      const  coach_id = req.params.coach_id
      if (!mongoose.Types.ObjectId.isValid(coach_id)) {
        return res.status(404).send("ID is not correct!!");
      }
      await Coach.findByIdAndUpdate(coach_id, { Admin: true }, { new: true }).then(
        (access) => {
          access.save();
        }
      );
  
      res.status(200).send("تم تفعيل خاصيه الادمن لهذا المستخدم ");
    } catch (e) {
      res.status(500).send(e.message);
    }
  };
  const unaccessAdmin = async (req, res) => {
    try {
      const  coach_id = req.params.coach_id
      if (!mongoose.Types.ObjectId.isValid(coach_id)) {
        return res.status(404).send("ID is not correct!!");
      }
      await Coach.findByIdAndUpdate(coach_id, { Admin: false }, { new: true }).then(
        (access) => {
          access.save();
        }
      );
  
      res.status(200).send("تم تعطيل خاصيه الادمن لهذا المستخدم ");
    } catch (e) {
      res.status(500).send(e.message);
    }
  };

  const deletePlayer = async (req, res) => {
    try {
      const user = req.user
        if(user.Admin){
      const player_id = req.params.player_id
      if (!mongoose.Types.ObjectId.isValid(player_id)) {
        return res.status(404).send("ID is not correct!!");
      }
    const data = await Player.findById(player_id)
    if(!data){res.status(404).send("هذا اللاعب غير موجود")}
     await Player.findByIdAndDelete(player_id);
        res.status(200).send(" Delete data is success ! ");
      }else{res.status(400).send('لست ادمن')}
    } catch (e) {
      res.status(500).send(e.message);
    }
  };
  const deleteAllPlayers = async (req, res) => {
    try {
      const user = req.user
        if(user.Admin){
      await Player.deleteMany();
  
      res.status(200).send(" Delete All data is success ! ");
    }else{res.status(400).send("لست ادمن")}
    } catch (e) {
      res.status(500).send(e.message);
    }
  };

  const deleteCoach = async (req, res) => {
    try {
      const user = req.user
        if(user.Admin){
      const coach_id = req.params.coach_id
      if (!mongoose.Types.ObjectId.isValid(coach_id)) {
        return res.status(404).send("ID is not correct!!");
      }
      const data = await Coach.findById(coach_id)
    if(!data){res.status(404).send("هذا المدرب غير موجود")}
     await Coach.findByIdAndDelete(coach_id);
      res.status(200).send(" Delete data is success ! ");
    }else{res.status(400).send("لست ادمن")}
    } catch (e) {
      res.status(500).send(e.message);
    }
  };

  const deleteAllCoachs = async (req, res) => {
    try {
      const user = req.user
        if(user.Admin){
      await Coach.deleteMany();
  
      res.status(200).send(" Delete All data is success ! ");
        }else{res.status(400).send("لست ادمن")}
    } catch (e) {
      res.status(500).send(e.message);
    }
  };

  const editPlayer = async (req, res) => {
    try {
      const user = req.user
        if(user.Admin){
      const player_id = req.params.player_id;
      const check = await Player.findById(player_id);
  
      if (!check) {
        return res.status(404).send("not found !!");
      }
      
      const {name ,coach ,mobile ,dateOfBirth ,nationality ,category ,card_Number}= req.body
    
        const updateData = {
            name ,coach ,mobile ,dateOfBirth ,nationality ,category ,card_Number
        };
     
     const file = req.files.find(f => f.fieldname === 'file')
       
    if(file){
         
             
      
            if (!file) {
              return res.status(400).send('No file uploaded.');
            }
          
            if (!admin.apps.length) {
              admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: process.env.STORAGE_BUCKET
              });
            }
            
            const bucket = admin.storage().bucket();
            const blob = bucket.file(file.filename);
            const blobStream = blob.createWriteStream({
              metadata: {
                contentType: file.mimetype
              }
            });
  
  
            await new Promise((reject) => {
              blobStream.on('error', (err) => {
                reject(err);
              });
  
              blobStream.on('finish', async () => {
                try {
                  await blob.makePublic();
                  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                  fs.unlinkSync(file.path);
                
                  updateData.picture = publicUrl;
  
                  const updatedQuestion = await Player.findByIdAndUpdate(player_id, updateData, { new: true });
    
        if (!updatedQuestion) {
          return res.status(404).send("هذا اللاعب غير موجود");
        }
     res.status(200).send(" تم تعديل بيانات اللاعب بنجاح");
                } catch (err) {
                  reject(err);
                }
              });
  
              fs.createReadStream(file.path).pipe(blobStream);
            });
          
           
          }
   if(!file){
    updateData.picture = 'empty'
    const updatedQuestion = await Player.findByIdAndUpdate(player_id, updateData, { new: true });
    
        if (!updatedQuestion) {
          return res.status(404).send("هذا اللاعب غير موجود");
        }
     res.status(200).send(" تم تعديل بيانات اللاعب بنجاح");
  }
    
}else{res.status(400).send("لست ادمن")}
      } catch (e) {
        res.status(500).send(e.message);
      }
    
}
 
const editCoach = async (req, res) => {
    try {
      const user = req.user
        if(user.Admin){
      const coach_id = req.params.coach_id;
      const check = await Coach.findById(coach_id);
  
      if (!check) {
        return res.status(404).send("not found !!");
      }
      
      const {name  ,mobile  ,nationality  ,card_Number}= req.body
    
        const updateData = {
            name ,mobile  ,nationality  ,card_Number
        };
      
    const file = req.files.find(f => f.fieldname === 'file')
       
    if(file){
         
              
      
            if (!file) {
              return res.status(400).send('No file uploaded.');
            }
          
            if (!admin.apps.length) {
              admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: process.env.STORAGE_BUCKET
              });
            }
            
            const bucket = admin.storage().bucket();
            const blob = bucket.file(file.filename);
            const blobStream = blob.createWriteStream({
              metadata: {
                contentType: file.mimetype
              }
            });
  
  
            await new Promise((reject) => {
              blobStream.on('error', (err) => {
                reject(err);
              });
  
              blobStream.on('finish', async () => {
                try {
                  await blob.makePublic();
                  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                  fs.unlinkSync(file.path);
                
                  updateData.picture = publicUrl;
                  const updatedQuestion = await Coach.findByIdAndUpdate(coach_id, updateData, { new: true });
                  console.log(updatedQuestion)
                  if (!updatedQuestion) {
                    return res.status(404).send("هذا اللاعب غير موجود");
                  }
               res.status(200).send(" تم تعديل بيانات اللاعب بنجاح");
                  
                } catch (err) {
                  reject(err);
                }
              });
  
              fs.createReadStream(file.path).pipe(blobStream);
            });
          
           
          }
   if(!file){
    updateData.picture = 'empty'
    const updatedQuestion = await Coach.findByIdAndUpdate(coach_id, updateData, { new: true });
   
    
        if (!updatedQuestion) {
          return res.status(404).send("هذا اللاعب غير موجود");
        }
     res.status(200).send(" تم تعديل بيانات اللاعب بنجاح");
  }
}else{res.status(400).send("لست ادمن")}
      } catch (e) {
        res.status(500).send('يوجد خطأ فى السيرفر ');
      }
    
}

  module.exports ={
    create_mainadmin,create_player,create_coach,login,getAllPlayer,getAllCoach,get_coach_Player,
    loginOut,getPlayer,getCoach,accessAdmin,unaccessAdmin,deletePlayer,deleteAllPlayers,deleteCoach,deleteAllCoachs,editPlayer,
    editCoach
  }
