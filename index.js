require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
app.use(
  cors({
    exposedHeaders: [
      "Content-Length",
      "x-token-access",
      "x-token-refresh",
      "x-total-count",
    ],
  })
);
const bearerToken = require("express-bearer-token");
app.use(bearerToken());
const PORT = 5000;
const morgan = require("morgan");
morgan.token("date", function (req, res) {
  return new Date();
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :date")
);

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

const { AuthRoutes, MovieRoutes } = require("./src/routes");

const response = (req, res) =>
  res.status(200).send("<h1>REST API JCWM1604</h1>");
app.get("/", response);

app.use("/user", AuthRoutes);
app.use("/movies", MovieRoutes);

app.all("*", (req, res) => {
  res.status(400).send("resource not found");
});

app.listen(PORT, () => console.log("listen in port" + PORT));
