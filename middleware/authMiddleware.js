const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log(token);
  if (!token) {
    return res
      .status(404)
      .json({ success: false, error: "Acceso denegado. No hay token" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
    req.uid = decoded.uid;
    next();
  } catch (error) {
    console.log(error);
    return res.status(404).json({ success: false, error: "Acceso denegado." });
  }
};

module.exports = { verifyToken };
