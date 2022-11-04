global.basedir = __dirname;
const express = require('express');
const cors = require('cors');
const router = require('./router');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/v1/', router);

app.listen(4000, () => {
  console.log('Ready ');
});

//Truongtran try to commit code
