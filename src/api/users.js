const express = require('express');
const { body, validationResult } = require('express-validator');
const passport = require("passport");

const  UserService = require('../services/user-service');
const { STATUS_CODES } = require('../utils/app-errors');
const { initiateError } = require('../utils/index');
const { getToken, verifyUser} = require('./middleware/auth')
const path = require("path");
const {currentUser} = require("./middleware/current-user");

/* GET users listing. */
const userRouter = () => {

  const router = express.Router();

  const service = new UserService();

  router.get('/', function(req, res, next) {
    res.json('respond with a resource');
  });

  router.get('/currentuser', currentUser, verifyUser, (req, res, next) => {
    res.send( req.user || null)
  })

  router.post('/signup',


      body("fullname", "Enter a valid name").isLength({ min: 3 }),
      body("email").isEmail().withMessage("Enter a valid email address"),
      body("password", "Enetr a valid a password").trim().notEmpty().isAlphanumeric(),

      async (req, res, next) => {
        try {

              const err = validationResult(req);
              if(!err.isEmpty()) initiateError(STATUS_CODES.BAD_REQUEST, err.array().map(item => item.param))

                req.body.username = req.body.email
                console.log(req.body)
              const { data } = await service.signUp(req.body);
              res.status(200).json(data)
        }catch (e) { next(e) }
  })

  router.post('/login',
          body("username", "Enter a valid email").trim().notEmpty().isEmail(),
          body("password", "Enetr a valid a password").trim().notEmpty().isAlphanumeric(),
          passport.authenticate("local", {session: false}),

          async (req, res, next) => {
            try {
              const err = validationResult(req);
              if(!err.isEmpty()) initiateError(STATUS_CODES.BAD_REQUEST, err.array().map(item => item.param))

              const { user } = req;
              if (!user.isActivate) initiateError(403, "Account not activated")

              const token = getToken({_id: user._id});
              res.setHeader("Content-Type", "application/json");
              req.session = { token: token }
              res.status(200).json({success: true, token: token, data: "You are successfully login "})

            }catch (e) { next(e) }
          }
      )


  router.get('/activate/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { data } = await service.activateUser(id)
        res.sendFile(path.join(__dirname, '..',  'template', 'success.html'))
    }catch (e) { next(e) }
  })

  return router;
}


module.exports = userRouter;
