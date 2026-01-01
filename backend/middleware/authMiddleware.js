const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
// const fetch = require('fetch'); // or use axios if already installed
const fetch = require('node-fetch');

const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const COGNITO_REGION = process.env.AWS_REGION;

// We need to fetch the JWKS from Cognito to verify the JWT
const COGNITO_JWKS_URL = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}/.well-known/jwks.json`;

let jwks = null;

// Middleware to authenticate the token
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Fetch and cache the JWKS
    if (!jwks) {
        const response = await fetch(COGNITO_JWKS_URL);
        jwks = await response.json();
    }

    // Decode the token to get the kid (Key ID)
    const decodedToken = jwt.decode(token, { complete: true });
    if (!decodedToken) {
        return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
    
    const kid = decodedToken.header.kid;
    const key = jwks.keys.find(k => k.kid === kid);
    if (!key) {
        return res.status(401).json({ message: 'Not authorized, signing key not found' });
    }

    // Convert the JWK to a PEM key
    const pem = jwkToPem(key);

    // Verify the token
    const verified = jwt.verify(token, pem, { algorithms: ['RS256'] });

    // Attach user info to the request object
    req.user = verified;
    next();

  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
  }
};

// Middleware to authorize based on user group
const authorize = (...groups) => {
    return (req, res, next) => {
        const userGroups = req.user['cognito:groups'] || [];
        const isAuthorized = groups.some(g => userGroups.includes(g));

        if (!isAuthorized) {
            return res.status(403).json({ message: `User is not authorized. Must be in one of the following groups: ${groups.join(', ')}` });
        }
        next();
    };
};

module.exports = { protect, authorize };