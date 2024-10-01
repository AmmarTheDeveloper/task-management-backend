const express = require( 'express' );
const Task = require( '../models/task' );
const { authMiddleware } = require( '../middleware/authMiddleware' );
const User = require( '../models/user' );
const router = express.Router();

router.get( '/', authMiddleware, async ( req, res ) => {
    try {
        const { status, assignedUser, startDate, endDate } = req.query;
        console.log( req.query )

        let query = {};

        if ( req.user.role !== 'admin' ) {
            query = {
                $or: [
                    { createdBy: req.user._id },
                    { assignedUser: req.user._id }
                ]
            };
        }

        if ( req.user.role === 'admin' && assignedUser && assignedUser != "all" ) {
            const user = await User.findById( assignedUser );
            if ( !user ) {
                return res.status( 400 ).json( { success: false, message: "Invalid assigned user" } );
            }
            query.assignedUser = user._id;
        }

        if ( status && status !== 'all' ) {
            query.status = status;
        }

        if ( startDate && endDate ) {
            query.dueDate = {
                $gte: new Date( startDate ),
                $lte: new Date( endDate )
            };
        } else if ( startDate ) {
            query.dueDate = { $gte: new Date( startDate ) };
        } else if ( endDate ) {
            query.dueDate = { $lte: new Date( endDate ) };
        }

        console.log( query )
        const tasks = await Task.find( query )
            .populate( {
                path: 'createdBy',
                select: "-password"
            } )
            .populate( {
                path: 'assignedUser',
                select: "-password"
            } );

        res.status( 200 ).json( { success: true, tasks } );
    } catch ( error ) {
        console.log( error )
        res.status( 500 ).json( { success: false, message: 'Error generating report', error } );
    }
} );

module.exports = router;
