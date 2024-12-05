const jwt = require("jsonwebtoken");

const { JWT_SECRET } = process.env;

const signJwt = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "1h",
  });
};

const verifyJwt = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    console.error("Invalid or expired token:", error.message);
    return null;
  }
};

module.exports = {
  signJwt,
  verifyJwt,
};
