const express = require( 'express' );
const mongoose = require( 'mongoose' );
const cors = require( 'cors' );
require( 'dotenv' ).config();

const PORT = process.env.PORT || 5000;

const authRoutes = require( './routes/auth' );
const taskRoutes = require( './routes/task' );
const reportRoutes = require( './routes/report' );

const app = express();
app.use( express.json() );
app.use( cors() );

//Database Connection
mongoose.connect( process.env.MONGO_URI )
    .then( () => console.log( 'Connected to MongoDB' ) )
    .catch( err => console.error( err ) );


app.get( "/", ( req, res ) => {
    res.json( "working" )
} )
//Routes
app.use( '/api/auth', authRoutes );
app.use( '/api/tasks', taskRoutes );
app.use( '/api/report', reportRoutes );

app.listen( PORT, () => {
    console.log( `Server running on port ${ PORT }` );
} )