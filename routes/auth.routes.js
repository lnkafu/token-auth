
const express = require('express')

const jwt = require('jwt')

const bcrypt = require('bcrypt')

const router = express.Router()

const personSchema = require('../models/person')

const authorize = require('../middleware/auth.js')

const {check, validationResult} = require('express-validator')

//signup
router.post('/registerUser',
[
    check('first')
        .not()
        .isEmpty()
        .isLength({
            min: 3
        })
        .withMessage('Name must be atleast 3 characters long'),
    
    check('name')
        .not()
        .isEmpty()
        .isLength({
            min: 3
        })
        .withMessage('Name must be atleast 3 characters long'),

    check('email', 'email is required')
        .not()
        .isEmpty(),
    
    check('password','password should be between 5 to 8 characters long')
        .not()
        .isEmpty()
        .isLength({
            min: 5,
            max: 8
        })
        

],

(req,res,next)=>{
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json(errors.array())
    }

    bcrypt.hash(req.body.password,10)
    .then((hashedPassword)=>{
        const user = new personSchema({
            first: req.body.first,
            last: req.body.last,
            email: req.body.email,
            password: hashedPassword
        })
        user.save()
            .then(res=>{
                res.status(201).json({
                    message: 'user successfully created',
                    data: user
                })
            })
            .catch(err=>{
                res.status(500).json({
                    message: "error creating user",
                    err: err
                })
            })
    })
})

//sign in
router.post('/signin', (req,res,next)=>{
    let getUser
    personSchema.findOne({
        email: req.body.email
    })
    .then(user=>{
        if (!user) return res.status(404).json({message:'authentication failed'})

        getuser = user
        return bcrypt.compare(req.body.password, getUser.password)
    })
    .then(res=>{
        if(!res) return res.status(401).json({message: 'auth failed'})

        let jwtToken = jwt.sign(
            {
                email: getUser.email,
                userId: getUser._id
            }, 
            'longer-secret-is-better', 
            {
                expiresIn: '1h'
            }
        )

        res.status(200).json({
            message: getuser,
            token: jwtToken,
            expiresIn: 3600
        })
    })
    .catch(err=>{
        return res.status(401).json({
            message: 'auth failed',
            err: err
        })
    })
})

//get all users
router.route('/users').get(authorize, (req,res)=>{
   
    personSchema.find((err,res)=>{
        if(err) return res.status(500).json({message: 'collection not found'})

        res.status(200).json(res)
    })
})

//get single user
router.route('/user/:user_id').get((req,res)=>{
    personSchema.findById(req.param.user_id, (err,res)=>{
        if (err) return res.status(401).json({message:'user not found', err: err})

        res.status(200).json({message: res})
    })
})

//update user
router.route('/updateUser/:user_id').put((req,res)=>{
    personSchema.findbyIdAndUpdate(req.params.user_id,{
        $set: req.body
    }, (err, res)=> {
        if (err) return res.status(401).json({message: 'user not found'})

        res.json(res)
    }
    )
})

//delete user
router.route('/deleteUser/:user_id').delete((req,res)=>{
    personSchema.findByIdAndRemove(req.params.user_id, (err,res)=>{
        if (err) return res.status(401).json({message: 'user not found'})

        res.status(200).json(res)
    })
})

module.exports = router