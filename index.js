require('dotenv').config();
const express = require('express');
const cors = require('cors');

const port = process.env.PORT || 5050;
const app = express();

app.use(cors({
  origin: ['https://smart-learn-online-tutor.netlify.app', 'http://localhost:5173'],
 credentials: true,
}));
// app.use(cors());
app.use(express.json());

const user = process.env.DB_USER;
const pass = process.env.DB_PASS;


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
    const tutorApplicationCollection = db.collection('tutorApplication');

    // Tutor Collection
    app.post('/tutors', async (req, res) => {
      const tutor = req.body;
      const data = await tutorCollection.insertOne(tutor);
      res.send(data);
    });

    app.get('/tutors', async (req, res) => {
      const tutor = await tutorCollection.find().toArray();
      return res.send(tutor);
    });

    //Tutor Like collection 

    app.get('/tutors/likes', async (req, res) => {
      const tutor = req.body;
      const data = await tutorCollection.find(tutor).toArray();
      res.send(data);
    });

    app.get('/tutors/likes/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const tutor = await tutorCollection.findOne(query);
      return res.send(tutor);
    });

    app.put('/tutors/likes/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateLikes = req.body;
      
      const update = {
        $set: {
          likes: updateLikes.likes,
        }
      }
      const result = await tutorCollection.updateOne(filter, update, options);
      res.send(result);
    });


    // Tutor Aplication API

    app.post('/tutorApplication', async (req, res) => {
      const application = req.body;
      const applicationData = await tutorApplicationCollection.insertOne(application);
      return res.send(applicationData);
    });

    app.get('/tutorApplication', async (req, res) => {
      const applicationData = await tutorApplicationCollection.find().toArray();
      return res.send(applicationData);
    });

    app.get('/tutorApplication/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const applicationData = await tutorApplicationCollection.findOne(query);
      res.send(applicationData);
    });

    app.put('/tutorApplication/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateApplication = req.body;
      
      const update = {
        $set: {
          status: updateApplication.status,
          role: updateApplication.role,
        }
      }
      const result = await tutorApplicationCollection.updateOne(filter, update, options);
      res.send(result);
    });

    // app.get('/tutors', async (req, res) => {
    //   const { language, name } = req.query;

    //   try {
    //     if (!language || !name) {
    //       const tutor = await tutorCollection.find().toArray();
    //       return res.send(tutor);
    //     } else {
    //       const tutor = await tutorCollection.find({
    //         language: { $regex: new RegExp(language, 'i') },
    //         name: { $regex: new RegExp(name, 'i') }
    //       }).toArray();
    //       return res.send(tutor);
    //     }
    //   } catch (error) {
    //     return res.status(500).send({ message: 'Server Error.'});
    //   }
    // });

    app.get('/tutors/tutor/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const tutor = await tutorCollection.findOne(query);
      res.send(tutor);
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
    });

    app.delete('/tutors/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const tutor = await tutorCollection.deleteOne(query);
      res.send(tutor);
    });

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
    app.get('/bookedTutor/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const tutor = await bookedTutorCollection.findOne(query);
      res.send(tutor);
    });

    app.delete('/bookedTutor/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const tutor = await bookedTutorCollection.deleteOne(query);
      res.send(tutor);
    });

    app.get('/addedTutor/:email', async (req, res) => {
      const email = req.params.email;
      const bookedTutor = await bookedTutorCollection.find({ email }).toArray();
      res.send(bookedTutor);
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