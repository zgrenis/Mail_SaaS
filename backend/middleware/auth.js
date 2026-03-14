const jwt = require('jsonwebtoken');  // verify hashed tokens

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;   // check authorization header from headers for token 
  if (!authHeader) return res.status(401).json({ error: 'Token gerekli' });

  const token = authHeader.split(' ')[1]; // solve "Bearer <token_burada>" format
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // verify and solve token with secret key and assign decoded user info to req.user for use in routes
    next();
  } catch {
    res.status(401).json({ error: 'Geçersiz token' });
  }
}

module.exports = authMiddleware;