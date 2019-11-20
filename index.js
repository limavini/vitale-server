const express = require("express");
var auth = require("./routes/auth");
require("./passport");
const graphqlHTTP = require("express-graphql");
const schema = require("./schema/schema");
const mongoose = require("mongoose");
var bodyParser = require("body-parser");
const cors = require("cors");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());
app.use(cors());
mongoose.connect(
  "mongodb+srv://admin:vitale123@cluster0-uatkq.mongodb.net/test?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

mongoose.connection.once("open", () => {
  console.log("Connected to database");
});
app.get("/", (req, res) => res.send("Hello World!"));
app.use("/auth", auth);

// GraphQL Middleware
// Usamos o graphqlHTTP para o express entender o GraphQL
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: false
  })
);
console.log("TESTE");
// Usando nodemon para manter o server atualizando
// npm i -g nodemon
app.listen(process.env.PORT);
