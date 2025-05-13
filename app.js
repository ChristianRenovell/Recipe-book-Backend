const express = require("express");
const loginRoutes = require("./routes/loginRoutes");
const usersRoutes = require("./routes/usersRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./uploads/",
  })
);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || origin === "https://recetalex.es" || origin === "") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
//app.use(cors());

app.use("/", loginRoutes);
app.use("/users", usersRoutes);
app.use("/recipe", recipeRoutes);
app.use("/review", reviewRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});
