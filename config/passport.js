const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const user = require('../model/user');

module.exports= function(passport){
    passport.use(
        new localStrategy({usernameField:'email'},(email, password, done)=>{
         user.findOne({Email:email})
         .then(user=>
            {
            if(!user)
            {
                return done(null,false,{message:'Email is not registered yet'});
            }

              // If User found then start matching passwords

            bcrypt.compare(password,user.Password,(err,isMatch)=>{
            if(err)
            {
                throw err;
            }

            if(isMatch)
            {
                return done(null,user);
            }
            else
            {
                return done(null,false,{message:'Password not mtaching for the user'});
            }
                
            });

            })

         .catch(err=>console.log(err));
        })
    );

    passport.serializeUser(function(user, cb) {
          return cb(null, user.id);
        });
      
      passport.deserializeUser(function(id, cb) {
        user.findById(id)
        .then((user)=> cb(null,user))
        .catch((err)=>cb(err))
      });

}