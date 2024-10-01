const mongoose = require( 'mongoose' );

const taskSchema = new mongoose.Schema( {
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: [ 'To Do', 'In Progress', 'Completed' ], default: 'To Do', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    priority: { type: String, enum: [ 'Low', 'Medium', 'High' ], default: 'Low', required: true },
}, { timestamps: true } );


const Task = mongoose.model( 'Task', taskSchema );
module.exports = Task;
