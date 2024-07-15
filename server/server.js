require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
const multer = require('multer');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const fs = require('fs');

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
      const { JobNumber, Client, Facility, JobValue, Pieces, RequiredByDate, Color, TestFit, Rush, Schedule } = req.body;

      try {
        const jobDetails = {
          JobNumber,
          Client,
          Facility,
          JobValue,
          Pieces,
          RequiredByDate,
          Color,
          TestFit,
          Rush,
          Schedule: Schedule || []
        };

        const result = await db.collection(COLLECTION_NAME).insertOne(jobDetails);
        res.json(result.ops[0]);
      } catch (error) {
        console.error('Error adding job detail:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    app.put('/jobdetails/:jobNumber/add-to-schedule', async (req, res) => {
      const { jobNumber } = req.params;
      const { date } = req.body;

      try {
        const result = await db.collection(COLLECTION_NAME).updateOne(
          { JobNumber: jobNumber },
          { $addToSet: { Schedule: date } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send('Job not found');
        }

        const updatedJob = await db.collection(COLLECTION_NAME).findOne({ JobNumber: jobNumber });
        res.json(updatedJob);
      } catch (error) {
        console.error('Error adding date to schedule:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    app.put('/jobdetails/:jobNumber/remove-from-schedule', async (req, res) => {
      const { jobNumber } = req.params;
      const { date } = req.body;

      try {
        const result = await db.collection(COLLECTION_NAME).updateOne(
          { JobNumber: jobNumber },
          { $pull: { Schedule: date } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send('Job not found');
        }

        const updatedJob = await db.collection(COLLECTION_NAME).findOne({ JobNumber: jobNumber });
        res.json(updatedJob);
      } catch (error) {
        console.error('Error removing date from schedule:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    app.put('/jobdetails/:jobId', async (req, res) => {
      const { jobId } = req.params;
      const updateData = req.body;

      try {
        const result = await db.collection(COLLECTION_NAME).updateOne(
          { _id: new ObjectId(jobId) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send('Job not found');
        }

        const updatedJob = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(jobId) });
        res.json(updatedJob);
      } catch (error) {
        console.error('Error updating job detail:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    app.delete('/jobdetails/:id', async (req, res) => {
      const { id } = req.params;
      try {
        const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
        res.json(result);
      } catch (error) {
        console.error('Error deleting job detail:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    const upload = multer({ dest: 'uploads/' });

    app.post('/upload', upload.single('file'), async (req, res) => {
      const file = req.file;
      if (!file) {
        return res.status(400).send('No file uploaded.');
      }

      let jobs = [];
      const filePath = file.path;

      if (file.mimetype === 'text/csv') {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            jobs.push(row);
          })
          .on('end', async () => {
            await saveJobsToDatabase(jobs, db);
            res.status(200).send('Batch jobs uploaded successfully.');
          });
      } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        const workbook = XLSX.readFile(filePath);
        const sheet_name_list = workbook.SheetNames;
        jobs = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        await saveJobsToDatabase(jobs, db);
        res.status(200).send('Batch jobs uploaded successfully.');
      } else {
        res.status(400).send('Unsupported file format.');
      }
    });

    const saveJobsToDatabase = async (jobs, db) => {
      const collection = db.collection(COLLECTION_NAME);

      jobs = jobs.map(job => ({
        JobNumber: job.JobNumber,
        Client: job.Client,
        Facility: job.Facility,
        JobValue: parseFloat(job.JobValue),
        Pieces: parseInt(job.Pieces, 10),
        RequiredByDate: new Date(job.RequiredByDate),
        Color: job.Color,
        TestFit: job.TestFit === 'yes' ? 'yes' : 'no',
        Rush: job.Rush === 'yes' ? 'yes' : 'no',
        Schedule: job.Schedule ? job.Schedule.split(',').map(date => new Date(date)) : [],
      }));

      for (const job of jobs) {
        const existingJob = await collection.findOne({ JobNumber: job.JobNumber });
        if (existingJob) {
          console.log(`Skipping existing job with JobNumber: ${job.JobNumber}`);
        } else {
          await collection.insertOne(job);
        }
      }
    };

    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname + '/../board/build/index.html'));
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.error('Error connecting to MongoDB', err));