require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '../board/build')));
const PORT = process.env.PORT || 5000;

const MONGO_URL = process.env.MONGODB_URI;
const COLLECTION_NAME = 'jobdetails';

app.use(express.json());

MongoClient.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((client) => {
    const db = client.db('board');

    app.use(express.static('public'));

    app.get('/', (req, res) => {
      res.send('Server is running. Please access the appropriate endpoints.');
    });

    app.get('/jobdetails', async (req, res) => {
      try {
        const jobDetails = await db.collection(COLLECTION_NAME).find().toArray();
        res.json(jobDetails);
      } catch (error) {
        console.error('Error fetching job details:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    app.post('/jobdetails', async (req, res) => {
      const { JobNumber, Client, Facility, JobValue, Pieces, RequiredByDate, Color, TestFit, Rush } = req.body;

      try {
        const result = await db.collection(COLLECTION_NAME).insertOne({ JobNumber, Client, Facility, JobValue, Pieces, RequiredByDate, Color, TestFit, Rush });
        res.json(result.ops[0]);
      } catch (error) {
        console.error('Error adding job detail:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    app.put('/jobdetails', async (req, res) => {
      const jobDetails = req.body;
      try {
        await db.collection(COLLECTION_NAME).deleteMany({});
        await db.collection(COLLECTION_NAME).insertMany(Object.values(jobDetails));
        const updatedDetails = await db.collection(COLLECTION_NAME).find().toArray();
        res.json(updatedDetails);
      } catch (error) {
        console.error('Error updating job details:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    app.delete('/jobdetails/:id', async (req, res) => {
      const { id } = req.params;
      try {
        const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: ObjectId(id) });
        res.json(result);
      } catch (error) {
        console.error('Error deleting job detail:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname + '/../board/build/index.html'));
    });

    app.listen(PORT, () => {
    });
  })
  .catch((err) => console.error('Error connecting to MongoDB', err));