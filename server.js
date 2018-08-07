const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');

const app = express();
const PORT = process.env.PORT || 4000;

const apiRouter = require('./routers/api');

app.use(bodyParser.json());
app.use(cors());
app.use(errorhandler());

app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log('Listening on port: ' + PORT);
});

module.exports = app;