const Task = require( "../models/task" );

const isAdmin = ( req, res, next ) => {
    if ( req.user.role !== 'admin' ) {
        return res.status( 403 ).json( { message: 'Access denied. Admins only.' } );
    }
    next();
};

const isTaskOwnerOrAdmin = async ( req, res, next ) => {
    const task = await Task.findById( req.params.id );
    if ( !task ) return res.status( 404 ).json( { message: 'Task not found' } );

    if ( task.createdBy.toString() !== req.user._id && req.user.role !== 'admin' ) {
        return res.status( 403 ).json( { message: 'Access denied. Not authorized to modify this task.' } );
    }
    next();
};

module.exports = { isAdmin, isTaskOwnerOrAdmin };
