const jwt = require("jsonwebtoken");
const Admin = require("../models/Main_Admin");
const Coach = require("../models/coach");


const coach_auth = async (req, res, Next) => {
  try {

    if (!req.headers) {
      return res.status(404).send(" please login !");
    }
    console.log(req.headers?.authorization);
    const token = req?.headers?.authorization.split(" ")[1];
    
    if (!token) {
      return res.status(401).send(" please login !");
    }
    
    const SECRETKEY = process.env.SECRETKEY;

    const result = jwt.verify(token, SECRETKEY, { complete: true });

    if (!result) {
      return res.status(400).send(" من فضلك قم بالتسجيل اولا ");
    }

    const user_1 = await Coach.findById(result.payload.id);
    req.user = user_1;

    Next();
    
  } catch (e) {
    res.status(500).send(e.message);
  }
};

const admin_auth = async (req, res, Next) => {
  try {
 // if (!req?.cookies) {
 //      return res.status(404).send(" please login !");
 //    }
 //    const token = req?.cookies?.access_token?.split(" ")[1];
    if (!req.headers) {
      return res.status(404).send(" please login !");
    }
    console.log(req.headers?.authorization);
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).send(" please login !");
    }
    
    const SECRETKEY = process.env.SECRETKEY;
    const result = jwt.verify(token, SECRETKEY, { complete: true });
    if (!result) {
      return res.status(400).send(" من فضلك قم بالتسجيل اولا ");
    }
    
    let user_1 = await Admin.findById(result.payload.id);
    if (!user_1) {
      user_1 = await Coach.findById(result.payload.id);
      if (!user_1) {
        return res.status(404).send("User not found");
      }
    }
    
    req.user = user_1;

    Next();
    
  } catch (e) {
    res.status(500).send(e.message);
  }
};
module.exports = {
  coach_auth,
  admin_auth,
};
