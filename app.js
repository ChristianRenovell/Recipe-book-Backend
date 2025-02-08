const express = require("express");
const loginRoutes = require("./routes/loginRoutes");
const bodyParser = require("body-parser");
const cors = require("cors");

const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(bodyParser.json());

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || origin === "" || origin === "") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

//app.use(cors(corsOptions));
app.use(cors());

app.use("/", loginRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});
