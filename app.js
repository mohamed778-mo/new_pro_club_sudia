const express = require('express');
const cors = require('cors');
const connection = require("./config/config");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const bodyParser = require("body-parser");

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");

const app = express();
app.use(express.json());


app.use(cookieParser());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());



let userRouter = require('./routers/user');
let audienceRouter = require('./routers/audience');


app.use('/app/user', userRouter);
app.use('/app/audience', audienceRouter);



app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

connection();

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Connection on port ${port}`);
});
