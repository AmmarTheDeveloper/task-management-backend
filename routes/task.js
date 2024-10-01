const express = require( 'express' );
const Task = require( '../models/task' );
const { taskValidation } = require( '../validation/taskValidation' );
const { authMiddleware } = require( '../middleware/authMiddleware' );
const { isTaskOwnerOrAdmin } = require( '../middleware/adminMiddleware' );
const { isValidObjectId } = require( 'mongoose' );
const router = express.Router();

router.post( '/', authMiddleware, async ( req, res ) => {

    try {

        const {
            title,
            description,
            dueDate,
            status,
            priority,
        } = req.body;

        const { error } = taskValidation( {
            title,
            description,
            dueDate,
            status,
            priority,
        } );

        if ( error ) return res.status( 400 ).json( { success: false, error: error.details[ 0 ].message } );



        let assignedUser = req.user._id;

        if ( req.user.role === 'admin' ) {
            if ( !req.body.assignedUser ) {
                return res.status( 400 )
                    .json( { success: false, message: "assignedUser field required." } )
            }
            assignedUser = req.body.assignedUser;
        }

        const task = new Task( {
            title,
            description,
            dueDate,
            status,
            priority,
            assignedUser,
            createdBy: req.user._id
        } );
        await task.save();
        res.status( 201 ).json( { success: true, task } );
    } catch ( error ) {

        res.status( 500 ).json( { success: false, message: "Error creating task", error } )
    }

} );

router.put( '/:id', authMiddleware, isTaskOwnerOrAdmin, async ( req, res ) => {
    try {
        const { title, description, dueDate, status, priority, assignedUser } = req.body;

        const { error } = taskValidation( {
            title,
            description,
            dueDate,
            status,
            priority,
        } );

        if ( error ) {
            return res.status( 400 ).json( { success: false, error: error.details[ 0 ].message } );
        }

        let updateFields = { title, description, dueDate, status, priority };

        if ( req.user.role === 'admin' && assignedUser ) {
            if ( !isValidObjectId( assignedUser ) ) {
                return res.status( 400 ).json( { success: false, error: 'Invalid assignedUser ID' } );
            }
            updateFields.assignedUser = assignedUser;
        }

        const updatedTask = await Task.findByIdAndUpdate( req.params.id, updateFields, { new: true } );

        if ( !updatedTask ) {
            return res.status( 404 ).json( { success: false, error: 'Task not found' } );
        }

        res.status( 200 ).json( { success: true, updatedTask } );
    } catch ( error ) {
        res.status( 500 ).json( { success: false, error: error.message } );
    }
} );

// Delete Task
router.delete( '/:id', authMiddleware, isTaskOwnerOrAdmin, async ( req, res ) => {
    try {
        const task = await Task.findByIdAndDelete( req.params.id );
        if ( !task ) return res.status( 404 ).json( { success: false, error: 'Task not found' } );
        res.json( { success: true, message: 'Task deleted successfully' } );
    } catch ( error ) {
        res.status( 500 ).json( { success: false, error: error.message } );
    }
} );

router.get( '/', authMiddleware, async ( req, res ) => {
    try {
        const page = parseInt( req.query.page ) || 1;
        const limit = parseInt( req.query.limit ) || 10;

        let query = {};

        if ( req.user.role === 'admin' ) {
            query = {};
        } else {
            query = {
                $or: [
                    { createdBy: req.user._id },
                    { assignedUser: req.user._id }
                ]
            };
        }

        const { status, priority, assignedUser } = req.query;

        if ( status && status !== 'all' ) {
            query.status = status;
        }

        if ( priority && priority !== 'all' ) {
            query.priority = priority;
        }

        if ( assignedUser && assignedUser !== 'all' ) {
            query.assignedUser = assignedUser;
        }

        const tasks = await Task.find( query )
            .populate( { path: "createdBy", select: "-password" } )
            .populate( { path: "assignedUser", select: "-password" } )
            .skip( ( page - 1 ) * limit )
            .limit( limit );

        const total = await Task.countDocuments( query );

        res.json( {
            tasks,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil( total / limit )
            }
        } );
    } catch ( error ) {
        res.status( 400 ).json( { message: 'Error fetching tasks', error } );
    }
} );

router.get( '/:id', authMiddleware, isTaskOwnerOrAdmin, async ( req, res ) => {
    try {
        const { id } = req.params;

        if ( !isValidObjectId( id ) ) {
            return res.status( 400 ).json( { success: false, message: 'Invalid task ID' } );
        }

        const task = await Task.findById( id )
            .populate( { path: 'createdBy', select: '-password' } )
            .populate( { path: 'assignedUser', select: '-password' } );

        if ( !task ) {
            return res.status( 404 ).json( { success: false, message: 'Task not found' } );
        }

        res.status( 200 ).json( { success: true, task } );
    } catch ( error ) {
        res.status( 500 ).json( { success: false, message: 'Error fetching task', error: error.message } );
    }
} );

module.exports = router;
