require('dotenv').config();
const express = require('express');
const cors = require('cors');

const port = process.env.PORT || 5050;
const app = express();

// app.use(cors({
//   origin: ['http://localhost:5173',
//     'https://smart-learn-online-tutor.netlify.app'],
//   optionsSuccessStatus: 200
// }));
app.use(cors());
app.use(express.json());

const user = process.env.DB_USER
const pass = process.env.DB_PASS


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const bookedTutorCollection = db.collection('bookedTutor');
    const tutorialsCollection = db.collection('tutorials');

    // Tutor Collection
    app.post('/tutors', async (req, res) => {
      const tutor = req.body;
      const data = await tutorCollection.insertOne(tutor);
      res.send(data);
    });


    app.get('/tutors', async (req, res) => {
      const tutor = tutorCollection.find();
      const filter = await tutor.toArray();
      res.send(filter);
    });

    app.get('/tutors/category/:language', async (req, res) => {
      const language = req.params.language;
      const tutor = tutorCollection.find({ language });
      const filter = await tutor.toArray();
      res.send(filter);
    });

    app.get('/tutors/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const tutor = await tutorCollection.findOne(query);
      res.send(tutor);
    });

    app.put('/tutors/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateTutorials = req.body;
      console.log(updateTutorials);
      
      const tutorials = {
        // name, language, image, price, review, details
          $set: {
              name: updateTutorials.name,
              language: updateTutorials.language,
              image: updateTutorials.image,
              price: updateTutorials.price,
              details: updateTutorials.details
          }
      }
      const result = await tutorCollection.updateOne(filter, tutorials, options);
      res.send(result);
    })

    // Booked Tutor Collection
    app.post('/bookedTutor', async (req, res) => {
      const bookTutor = req.body;
      const data = await bookedTutorCollection.insertOne(bookTutor);
      res.send(data);
    });

    app.get('/bookedTutor', async (req, res) => {
      const bookedTutor = bookedTutorCollection.find();
      const filter = await bookedTutor.toArray();
      res.send(filter);
    });

    // UserTutorials Collection

    app.get('/tutorials/:userEmail', async (req, res) => {
      const userEmail = req.params.userEmail;
      const tutorials = tutorCollection.find({ userEmail });
      const filter = await tutorials.toArray();
      res.send(filter);
    });

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', async (req, res) => {
  res.send('SmartLearn online tutor platform');
});


app.listen(port, function () {
  console.log(`Server is running at PORT: ${port}`);
});