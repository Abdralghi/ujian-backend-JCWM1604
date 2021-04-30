const jwt = require("jsonwebtoken");

module.exports = {
  createAccessToken: (data) => {
    const key = "saitama";
    const token = jwt.sign(data, key, { expiresIn: "24h" });
    return token;
  },
};
