module.exports.checkNoteID = (req, res, next) => {
    let noteid = req.params.noteid;
    if (noteid) {
        req.noteid = noteid;
        next();
    }
    else {
        res.status(400).json({
            error: "Manca l'id della nota"
        });
    }
}