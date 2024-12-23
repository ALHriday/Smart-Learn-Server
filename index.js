require('dotenv').config();
const express = require('express');
const cors = require('cors');

const port = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());


app.get('/', async (req, res) => {
    res.send('Hello Express');
});


app.listen(port, function () {
    console.log(`Server is running at PORT: ${port}`);
});