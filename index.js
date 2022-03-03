const express = require("express");
require('dotenv').config()
const expressLayouts = require("express-ejs-layouts");
const router = require("./routes");
const path = require("path");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const morgan = require("morgan");
const passport = require("./config/passport");

const db = require("./config/db");

require("./models/Usuarios");
require("./models/Categorias");
require("./models/Comentarios");
require("./models/Grupos");
require("./models/Meetis");

db.sync()
  .then(res => {
    console.log(`Database ${res.config.database} running on port ${res.config.port}`);
  })
  .catch(error => console.log(error));

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser());
app.use(
  session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
  res.locals.mensajes = req.flash();
  const fecha = new Date();
  res.locals.year = fecha.getFullYear();
  if (req.user) {
    res.locals.usuario = { ...req.user } || null;
    res.locals.isAutenticado = true;
  }

  next();
});

app.use("/", router());

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
