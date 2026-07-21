require('dotenv').config();
const express = require('express');
const cors = require('cors');

const port = process.env.PORT || 5050;
const app = express();

app.use(cors({
  origin: ['https://smart-learn-online-tutor.netlify.app', 'http://localhost:5173'],
  credentials: true,
}));

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
    const tutorRatingCollection = db.collection('tutorRating');

    // Tutor Collection
    app.post('/tutors', async (req, res) => {
      const tutor = req.body;
      const data = await tutorCollection.insertOne(tutor);
      res.send(data);
    });

    app.get('/tutors', async (req, res) => {

      // For pagination
      const { search, page, limit } = req.query;

      try {
        const limitNum = parseInt(limit);
        const skip = (parseInt(page) - 1) * limitNum;
        // const searchLang = search.trim();

        if (search) {
          const tutor = await tutorCollection.find({ language: { $regex: `${search || ''}`, $options: 'i' } }).limit(limitNum).skip(skip).toArray();
          return res.send(tutor);
        } else if (0 < skip || limitNum) {

          const tutor = await tutorCollection.find().limit(limitNum).skip(skip).toArray();
          return res.send(tutor);
        } else {
          const tutor = await tutorCollection.find().limit(limitNum).skip(skip).toArray();
          return res.send(tutor);
        }
      } catch (error) {
        return res.status(500).send({ error: error.message });
      }
    });

    app.get('/stats', async (req, res) => {
      try {
        const tutorLen = await tutorCollection.estimatedDocumentCount();
        const stats = await tutorCollection.aggregate([
          {
            $group: {
              _id: "$language",
            }
          },
          {
            $project: { _id: 0, language: "$_id" }
          },
          { $sort: { language: 1 } }
        ]).toArray();
        return res.status(200).send({ tutorLen: tutorLen, languages: stats?.map(lang => lang.language) });

      } catch {
        return res.status(500).send({ message: 'Mongodb server error!' })
      }
    })

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


    // Tutor Application API

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




    // Tutor Rating SetUp

    app.post('/tutor/rating', async (req, res) => {
      const { userId, tutorId, rating } = req.body;

      const existing = await tutorRatingCollection.findOne({ tutorId, userId });

      if (existing) {
        return res.status(200).json({ message: "data already exist." });
      }

      const tutorRating = await tutorRatingCollection.insertOne({ userId, tutorId, rating });
      res.send(tutorRating);
    });



    app.get('/rating', async (req, res) => {
      const { tutorId } = req.query;

      if (tutorId) {
        const result = await tutorRatingCollection.find({ tutorId }).toArray();
        return res.send(result);
      }
      res.status(200).json({ success: true, message: "No Data Found!", data: [] })
    });

    app.get("/tutor/rating", async (req, res) => {
      const { tutorId, userId } = req.query;

      const result = await tutorRatingCollection.findOne({
        tutorId,
        userId,
      });

      res.send(result);
    });

    app.patch('/tutor/rating', async (req, res) => {
      try {
        const { tutorId, userId, rating } = req.body;

        const existing = await tutorRatingCollection.findOne({
          tutorId,
          userId,
        });

        if (!existing) {
          return res.status(404).json({
            message: "Rating not found",
          });
        }

        if (existing.rating === Number(rating)) {
          return res.status(400).json({
            message: "Cannot update same rating!",
          });
        }

        const result = await tutorRatingCollection.updateOne(
          {
            tutorId,
            userId,
          },
          {
            $set: {
              rating: Number(rating),
            },
          }
        );

        res.status(200).json({
          message: "Rating updated",
          result,
        });

      } catch (err) {
        console.error(err);
        res.status(500).json({
          message: "Something went wrong!",
        });
      }
    });




    // Booked Tutor Collection
    app.post('/bookedTutor', async (req, res) => {
      try {
        const bookTutor = req.body;
        const data = await bookedTutorCollection.insertOne(bookTutor);
        return res.status(200).send(data);
      } catch {
        return res.status(500).send({ message: 'Server Error' });
      }
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