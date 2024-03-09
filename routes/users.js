const express =require('express');
const router =express.Router();
const userModel = require('../model/user');
const bcrypt= require('bcryptjs');
const passport =require('passport');

router.get('/login',(req,res)=>{
    res.render("login");
})

router.get('/register',(req,res)=>{
    res.render("register");
})

router.post('/register',(req,res)=>{
        let err=[];
        const {fname,lname,email,password1,password2}=req.body;
        if(password1!==password2)
        err.push({msg:'Non Matching Passwords Entered'});

        if(fname==null||lname==null||email==null||password1==null||password2==null)
        err.push({msg:'Do not leave required fields empty'});
    
        if(password1.length<5)
        err.push({msg:'Password Smaller than 5 digits'});
        if(err.length>0)
        {
        res.render('register',
        {
        err,fname,lname,email,password1,password2
    });
    }
    else{
        userModel.findOne({ email:email })
        .then(user=>{
            // If user already exists with the same email
            if(user)
            {
                err.push({msg: 'Email already Registered'});
                res.render('register',{err,fname,lname,email,password1,password2});
            }
            else
            {
              const newUser = new userModel(
                
                    {
                    Firstname: fname,
                    Lastname:lname,
                    Email:email,
                    Password:password1
                    }
                
              );
             
              // Password Hashing 
              bcrypt.genSalt(10,(err,salt)=>
              bcrypt.hash(newUser.Password,salt,(err,hash)=>{
              if(err)
              throw err;
              newUser.Password=hash;
              newUser.save().then(user=>{
                req.flash('success_msg','You are now registered!!! Try logging in');
                res.redirect('/users/login');
               })
               .catch (err=>console.log(err));

              }));

            }
        });
      
    }
    
})


// Login Request Handler
router.post('/login',(req,res,next)=>{
 passport.authenticate('local',{
    successRedirect:'/dashboard',
    failureRedirect:'/users/login',
    failureFlash:true
 })(req, res, next);
});


// Log Out Request
router.get('/logout',(req,res,next)=>{
  req.logOut((err=>{
    if(err)
    {
        return  next(err);
    }
    req.flash('success_msg', 'You are logged Out');
    res.redirect('/users/login');
  }));
  
});

// Deletion Portal
router.get('/delete',(req,res)=>
{
  res.render('delete');
});

router.post('/accountDelete',(req,res,next)=>{
    const {email}=req.body;
    console.log(email);
    passport.authenticate('local',{
        failureRedirect:'/users/accountDelete',
        failureFlash:true
     })(req, res, ()=>{
        
        // Authentication successful, proceed with account deletion
        userModel.findOneAndDelete({ Email: email })
        .then(
         ()=> {
                req.flash('success_msg', 'You have deleted the account successfully');
                res.redirect('/');
            }
        )
        .catch(
            err => {
                console.error(err);
                req.flash('error_msg', 'Failed to delete the account');
                res.redirect('/users/accountDelete');
            }
        )
     });
 
     
    
});
 


module.exports=router;