module.exports.checkUserID = (req, res, next) => {
    let userid = req.params.userid;
    if (userid) {
        req.userid = userid;
        next();
    }
    else {
        res.status(400).json({
            error: "Manca l'id dell'utente"
        });
    }
}