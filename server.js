const express = require('express');
const routes = require('./routes/index');

const app = express();
const port = process.env.PORT || 5000;

app.get('/status', routes.AppController.getStatus);
app.get('/stats', routes.AppController.getStats);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
