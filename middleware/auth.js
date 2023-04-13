const user=require('../models/User');
const jwt=require('jsonwebtoken');



exports.isAuthenticated=async(req,res,next)=>{
   try{
    const {token}=req.cookies;
    if(!token){
        return res.status(400).json({
            success:false,
            message:"You have to login to access this resource"
        })
    }
    
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    req.user=await user.findById(decoded.id);
    
    next();

   }catch(error){
       res.status(500).json({
           success:false,
           message:error.message
       })
   }

};