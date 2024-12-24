require('dotenv').config();
const express = require('express');
const cors = require('cors');

const port = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());

const user = process.env.DB_USER
const pass = process.env.DB_PASS


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${user}:${pass}@cluster0.lgngp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

    const db = client.db('smartLearn');
    const tutorCollection = db.collection('tutors');

    app.post('/tutors', async (req, res) => {
      console.log(req.body);
      const tutor = req.body;
      const data = await tutorCollection.insertOne(tutor);
      res.send(data);
    });

    app.get('/tutors', async (req, res) => {
      const tutor = tutorCollection.find();
      const filter = await tutor.toArray();
      res.send(filter);
    })
    app.get('/tutors/:language', async (req, res) => {
      const language = req.params.language;
      const tutor = tutorCollection.find({language});
      const filter = await tutor.toArray();
      res.send(filter);
    })

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', async (req, res) => {
  res.send('Hello Express');
});


app.listen(port, function () {
  console.log(`Server is running at PORT: ${port}`);
});