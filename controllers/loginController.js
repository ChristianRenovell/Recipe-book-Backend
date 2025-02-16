const admin = require("../firebase-admin");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const idToken = req.body.token;
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const sessionToken = jwt.sign({ uid }, process.env.JWT_SECRET_TOKEN, {
      expiresIn: process.env.JWT_EXPIRES,
    });

    res.json({ success: true, token: sessionToken });
  } catch (error) {
    console.log(error);
    res.status(401).json({ success: false, error: "Usuario no encontrado" });
  }
};
