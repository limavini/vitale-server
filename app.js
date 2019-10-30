const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();


// permite a conexao com outro servidor
app.use(cors());


mongoose.connect('mongodb+srv://admin:minhasenha1@cluster0-uatkq.mongodb.net/test?retryWrites=true&w=majority', {
    useNewUrlParser: true
});

mongoose.connection.once('open', () => {
    console.log('Connected to database');
});

// GraphQL Middleware
// Usamos o graphqlHTTP para o express entender o GraphQL
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));

// Usando nodemon para manter o server atualizando
// npm i -g nodemon
app.listen(4000, () => {
    console.log("Now listening for requests on port 4000");
});