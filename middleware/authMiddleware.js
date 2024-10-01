const jwt = require( 'jsonwebtoken' );

const authMiddleware = ( req, res, next ) => {
    const token = req.header( 'Authorization' )?.split( ' ' )[ 1 ];
    if ( !token ) return res.status( 401 ).json( { success: false, error: 'No token, authorization denied' } );

    try {
        const decoded = jwt.verify( token, process.env.JWT_SECRET );
        req.user = decoded;
        next();
    } catch ( err ) {
        res.status( 401 ).json( { success: false, error: 'Invalid token' } );
    }
};

const alreadyLoggedInMiddleware = ( req, res, next ) => {
    const token = req.header( 'Authorization' )?.split( ' ' )[ 1 ];

    if ( token ) {
        try {
            const decoded = jwt.verify( token, process.env.JWT_SECRET );
            return res.status( 403 ).json( { success: false, error: 'You are already logged in' } );
        } catch ( err ) {
            next();
        }
    } else {
        next();
    }
};

module.exports = { authMiddleware, alreadyLoggedInMiddleware };