const jwt = require('jsonwebtoken');

const SEED = require('../config/config').SEED;


//=============================
// verificar token
//=============================

exports.verificaToken = function (req, res, next) {
    let token = req.query.token || req.headers['x-access-token'] || req.headers['authorization'];

    if (token) {
        if (token.startsWith('Bearer ')) {
            // Remove Bearer from string
            token = token.slice(7, token.length);
        }

        jwt.verify(token, SEED, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    ok: false,
                    mensaje: 'Token no valido',
                    errors: err
                });
            }
            req.usuario = decoded.usuario;
            next();
        });
    } else {
        return res.status(401).json({
            success: false,
            message: 'Token no proporcionado'
        });
    }

}