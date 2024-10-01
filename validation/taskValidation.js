const Joi = require( 'joi' );

const taskValidation = ( data ) => {
    const schema = Joi.object( {
        title: Joi.string().min( 3 ).required(),
        description: Joi.string().allow( '' ),
        dueDate: Joi.date().required(),
        status: Joi.string().valid( 'To Do', 'In Progress', 'Completed' ).default( 'To Do' ),
        priority: Joi.string().valid( 'Low', 'Medium', 'High' ).default( 'Low' ),
    } );
    return schema.validate( data );
};

module.exports = { taskValidation };
