const express =require('express');
const router =express.Router();
const userModel = require('../model/user');
const bcrypt= require('bcryptjs');
const passport =require('passport');
const {ensureAuthenticated}=require('../config/auth');

router.get('/login',(req,res)=>{
    res.render("login");
})

router.get('/register',(req,res)=>{
    res.render("register");
})

//Error Checks
function checks(req){
    let err=[];
    const {fname,lname,email,password1,password2}=req.body;
    if(password1!==password2)
    err.push({msg:'Non Matching Passwords Entered'});

    if(fname==null||lname==null||email==null||password1==null||password2==null)
    err.push({msg:'Do not leave required fields empty'});

    if(password1.length<5)
    err.push({msg:'Password Smaller than 5 digits'});

    return err;
}

//Registering new Users 
router.post('/register',(req,res)=>{
    let err=checks(req);
    const {fname,lname,email,password1,password2}=req.body;
    if(err.length>0)
    {
        res.render('register',
        {
        err,fname,lname,email,password1,password2
        });
    }
    else{
        userModel.findOne({ Email:email })
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

// Update Page 
router.get('/update',ensureAuthenticated,(req,res)=>
{
    res.render('update');
});


// Update credentials of user
router.post('/updatePassword',ensureAuthenticated,(req,res)=>
{   const err=[];
    const {email,password1,password2}=req.body;
    console.log(email);
    if(password1.length<5)
    err.push({msg:'Password Smaller than 5 digits'});
    if(password1!==password2)
    err.push({msg:'Passwords not matching'});
    if(err.length>0)
    {
        res.render('update',
        {
        err,email,password1,password2
        });
    }
    else{
        bcrypt.genSalt(10,(err,salt)=>
        bcrypt.hash(password1,salt,(err,hash)=>{
        if(err)
        console.log(err);
        
        userModel.findOneAndUpdate({Email:email},{$set:{Password:hash}})
        .then((user)=>{
            
               if(!user)
               throw error;
                req.flash('success_msg', 'Password updated successfully');
                res.redirect('/users/logout');
             })
        .catch(()=>{
            req.flash('err_msg', 'User not found with the email');
            res.redirect('/users/update');
        });

        }));

        
    }

});


 


module.exports=router;