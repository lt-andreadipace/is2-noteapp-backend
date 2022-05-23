module.exports.userCheck =  (req, res, next) => {
    let bearerToken = req.headers['authorization'];
    if (bearerToken) {
        const bearer = bearerToken.split(" ");
        const token = bearer[1];
        jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
            if (err) {
                res.status(403).json({
                    error: "Bearer token invalido"
                });
                return;
            }
            req.token = token;
            req.user = decoded;
            next();
        });
    }
    else {
        res.status(401).json({
            error: "Manca il token Bearer"
        });
    }
}