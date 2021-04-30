const jwt = require("jsonwebtoken");

module.exports.verifyTokenAccess = (req, res, next) => {
  console.log("token", req.token);
  const token = req.token;
  const key = "saitama"; // kata kunci terserah
  jwt.verify(token, key, (err, decoded) => {
    if (err) return res.status(401).send({ message: "user unauthorized" });
    console.log(decoded);
    req.user = decoded;
    console.log(req.user);
    next();
  });
};
