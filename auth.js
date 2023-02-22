const jwt = require("jsonwebtoken")

module.exports = async function isAuthenticated(req, res, next) {
    // get the token from the header if present
    const token = req.headers["authorization"].split(" ")[1];

    // verify token
    jwt.verify(token, "secret", (err, user) => {
        if (err) {
            console.log(err)
            return res.status(401).send({
                "success": false,
                "message": err
            })
        } else {
            req.user = user;
            next();
        }
    })

}
