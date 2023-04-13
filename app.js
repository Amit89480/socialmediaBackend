const express=require('express')
const app=express();
const cookieParser=require('cookie-parser');

if(process.env.NODE_ENV!=="production"){
require('dotenv').config({path:"backend/config/config.env"})
}


//using middlewares

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(require('cookie-parser')());



//importing routes

const post=require('./routes/Post');
const user=require('./routes/User');

//using routes
app.use('/api/',post);
app.use('/api/',user);

module.exports=app;