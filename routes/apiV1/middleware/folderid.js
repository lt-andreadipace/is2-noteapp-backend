module.exports.checkFolderID = (req, res, next) => {
    let folderid = req.params.folderid;
    if (folderid) {
        req.folderid = folderid;
        next();
    }
    else {
        res.status(400).json({
            error: "Manca l'id della cartella"
        });
    }
}