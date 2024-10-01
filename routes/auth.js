const express = require( 'express' );
const jwt = require( 'jsonwebtoken' );
const bcrypt = require( 'bcryptjs' );
const User = require( '../models/user' );
const { registerValidation, loginValidation } = require( '../validation/userValidation' );
const { alreadyLoggedInMiddleware, authMiddleware } = require( '../middleware/authMiddleware' );
const { isAdmin } = require( '../middleware/adminMiddleware' );
const router = express.Router();

// Register
router.post( '/register', alreadyLoggedInMiddleware, async ( req, res ) => {
    try {
        const { error } = registerValidation( req.body );
        if ( error ) return res.status( 400 ).json( { error: error.details[ 0 ].message } );

        const { username, email, password } = req.body;
        const emailExist = await User.findOne( { email } );
        if ( emailExist ) return res.status( 400 ).json( { success: false, error: 'Email already exists' } );

        const usernameExist = await User.findOne( { username } );
        if ( usernameExist ) return res.status( 400 ).json( { success: false, error: "Username already taken" } );

        const newUser = new User( { username, email, password } );
        await newUser.save();

        res.status( 201 ).json( { success: true, message: 'User registered successfully' } );
    } catch ( error ) {
        res.status( 500 ).json( { success: false, message: error.message } )
    }
} );

router.post( '/login', alreadyLoggedInMiddleware, async ( req, res ) => {
    try {
        const { error } = loginValidation( req.body );
        if ( error ) return res.status( 400 ).json( { success: false, error: error.details[ 0 ].message } );

        const { email, password } = req.body;
        const user = await User.findOne( { email } );

        if ( !user ) {
            return res.status( 400 ).json( { success: false, error: 'Invalid email or password' } );
        }

        const validPassword = await bcrypt.compare( password, user.password );

        if ( !validPassword ) {
            return res.status( 400 ).json( { success: false, error: 'Invalid email or password' } );
        }

        const payload = {
            _id: user._id, username: user.username, email: user.email,
            role: user.role
        }

        const token = jwt.sign( payload, process.env.JWT_SECRET, { expiresIn: '14d' } );

        res.json( { success: true, token, user: payload } );

    } catch ( error ) {
        return res.status( 500 ).json( { success: false, message: error.message } )
    }
} );

router.get( "/verify-token", authMiddleware, ( req, res ) => {
    return res.status( 200 ).json( { success: true, message: "Valid token", user: req.user } )
} )

router.get( '/users', authMiddleware, isAdmin, async ( req, res ) => {
    try {
        const users = await User.find( { role: "user" }, { password: 0 } );

        res.json( { success: true, users } );
    } catch ( error ) {
        res.status( 500 ).json( { success: false, message: error.message } );
    }
} );


module.exports = router;
