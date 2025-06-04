const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  console.log('Middleware d\'authentification en cours d\'exécution');
  console.log('Headers de la requête:', req.headers);
  
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token extrait des headers:', token);
  }

  if (!token) {
    console.log('Aucun token fourni');
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    console.log('Tentative de vérification du token avec le secret:', process.env.JWT_SECRET || 'monSuperSecretJWT');
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'monSuperSecretJWT');
    console.log('Token décodé avec succès:', decoded);
    console.log('Decoded ID:', decoded.id);
    
    // Check if decoded.id is potentially the problematic "guest" string or not a valid ObjectId
    if (decoded.id === 'guest' || !require('mongoose').Types.ObjectId.isValid(decoded.id)) {
        console.log('Invalid or guest ID in token:', decoded.id);
        return res.status(401).json({
            success: false,
            error: 'Invalid user ID in token'
        });
    }

    const user = await User.findById(decoded.id);
    console.log('Utilisateur trouvé:', user ? 'Oui' : 'Non');
    
    req.user = user;
    if (!req.user) {
      console.log('Utilisateur non trouvé dans la base de données');
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }
    console.log('Authentification réussie pour l\'utilisateur:', req.user._id);
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

module.exports = { protect }; 