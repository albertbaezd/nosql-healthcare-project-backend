const { verifyJwt } = require("../lib/jwt");
const User = require("../models/user");

const isAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token) return res.status(401).json({ error: "Token not provided" });

    if (!token.startsWith("Bearer "))
      return res.status(401).json({ error: "Bearer not defined" });

    const authToken = token.substring(7);

    const userId = verifyJwt(authToken);

    if (!userId) return res.status(401).json({ error: "Invalid token" });

    const user = await User.findById(userId);

    if (!user) return res.status(401).json({ error: "Unauthenticated" });

    return next();
  } catch (error) {
    res.status(500).json({ message: "Unexpected error" });
  }
};

module.exports = isAuth;
