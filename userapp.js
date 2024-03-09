const express=require('express');
const router =require('./routes/home');
const flash = require('connect-flash');
const session = require('express-session');
const passport =require('passport');

// Passport config
require('./config/passport')(passport);
//Defined EJS for view
const layout=require('express-ejs-layouts');
const userapp=express();

//Database connect
const mongoose=require('mongoose');
const db= require('./config/keys').MongoURI;
mongoose.connect(db).then(()=>console.log("Database connected"))
.catch(err=> console.log(err));

//Using EJS for view in our app
userapp.use(layout);
userapp.set('view engine','ejs');

userapp.use(express.urlencoded({extended:false}));

// Express Session
userapp.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  }));

// Passport 
userapp.use(passport.session());


userapp.use(flash());
userapp.use(
    (req,res,next)=>{
     res.locals.success_msg=req.flash('success_msg');
     res.locals.err_msg=req.flash('err_msg');
     res.locals.error=req.flash('error');
     next();
    }
)

userapp.use('/',router);
userapp.use('/users',require('./routes/users'));
const PORT=process.env.PORT||5000;
userapp.listen(PORT,console.log(`Server running  on ${PORT}`));
