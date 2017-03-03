const express = require('express');
const authRoutes = express.Router();

const bcrypt = require('bcrypt');
const User = require('../models/user.js');

authRoutes.get('/signup', (req,res,next)=>{
  res.render('auth/signup.ejs',{
    errorMessage: ''
  });
});

//Post route for signup form submission
authRoutes.post('/signup',(req,res,next)=>{
  const nameInput = req.body.name;
  const emailInput = req.body.email;
  const passwordInput = req.body.password;

  if (emailInput === '' || passwordInput ===''){
    res.render('auth/signup-view.ejs', {
      errorMessage: 'Please fill out both username and password foo\'!'
    });
    return;
  }

  //Checks to see if user exists.//logic now resides in the callback function
  User.findOne({ email: emailInput}, '_id',(err,existingUser)=>{
    if(err){
      next(err);
      return;
    }
    //If the foundUser is not null (meaning it does have something),render
    // page with error message and early return.
    if(existingUser !== null){
      res.render('auth/signup-view.ejs', {
        errorMessage: 'The username already exists'
      });
      return;
    }
    // if username does not exist, continue with usercreation.
    const salt = bcrypt.genSaltSync(10);
    const hashPass = bcrypt.hashSync(passwordInput, salt);

    //create userinfo with hashed password
    const userInfo = {
      name: nameInput,
      email: emailInput,
      password: hashPass
    };
    //Create user object with user model using entered userInfo (username and password)
    const theUser = new User(userInfo);

    theUser.save((err)=>{
      if(err){
        res.render('auth/signup-view.ejs',{errorMessage: 'Oops! There was a problem saving. Try again later.'});
        return;
      }else{
        //can be whatever message (ok, okMessage, success)
        //          |
        req.flash('success','You have been registered. Try logging in.');
        res.redirect('/');
      }

    });
  });
});

module.exports = authRoutes;
