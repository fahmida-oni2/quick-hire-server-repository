const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.pwy4qnn.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Validation helpers
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isValidObjectId = (id) => {
  return /^[a-fA-F0-9]{24}$/.test(id);
};
// Validation middleware for creating a job
const validateJob = (req, res, next) => {
  const {
    title,
    company,
    location,
    category,
    jobType,
    description,
    postedByEmail,
    postedByName,
  } = req.body;

  const errors = [];
  if (!title || title.trim().length < 3)
    errors.push("Job title is required and must be at least 3 characters.");

  if (!company || company.trim().length < 2)
    errors.push("Company name is required and must be at least 2 characters.");

  if (!location || location.trim().length < 2)
    errors.push("Location is required.");

  const validCategories = [
    "Engineering",
    "Technology",
    "Business",
    "Design",
    "Marketing",
    "Finance",
    "Sales",
    "Human Resources",
    "Other",
  ];
  if (!category || !validCategories.includes(category))
    errors.push(`Category must be one of: ${validCategories.join(", ")}.`);

  const validJobTypes = [
    "Full Time",
    "Part Time",
    "Remote",
    "Internship",
    "Contract",
    "Freelance",
  ];
  if (!jobType || !validJobTypes.includes(jobType))
    errors.push(`Job type must be one of: ${validJobTypes.join(", ")}.`);

  if (!description || description.trim().length < 20)
    errors.push("Description is required and must be at least 20 characters.");

  if (!postedByEmail || !isValidEmail(postedByEmail))
    errors.push("A valid  email is required.");

  if (!postedByName || postedByName.trim().length < 2)
    errors.push("Valid name is required.");

  if (errors.length > 0) {
    return res.status(400).send({ success: false, errors });
  }

  next();
};
// Validation middleware for submitting an application
const validateApplication = (req, res, next) => {
  const { name, email, resumeLink, coverNote, jobId, jobTitle, company } =
    req.body;

  const errors = [];

  if (!name || name.trim().length < 2)
    errors.push("Full name is required and must be at least 2 characters.");

  if (!email || !isValidEmail(email))
    errors.push("A valid email address is required.");

  if (!resumeLink || !isValidUrl(resumeLink))
    errors.push("A valid resume URL is required (must start with http/https).");

  if (!coverNote || coverNote.trim().length < 10)
    errors.push("Cover note is required and must be at least 10 characters.");

  if (!jobId || !isValidObjectId(jobId))
    errors.push("A valid job ID is required.");

  if (!jobTitle || jobTitle.trim().length < 2)
    errors.push("Job title is required.");

  if (!company || company.trim().length < 2)
    errors.push("Company name is required.");

  if (errors.length > 0) {
    return res.status(400).send({ success: false, errors });
  }

  next();
};

async function run() {
  try {
    // await client.connect();
    const db = client.db("hire-db");
    const jobCollection = db.collection("jobs");
    const applicationCollection = db.collection("applications");

    // GET all jobs
    app.get("/jobs", async (req, res) => {
      const { email, title, location, category } = req.query;
      const query = {};

      if (email) query.postedByEmail = email;
      if (title) query.title = { $regex: title, $options: "i" };
      if (location) query.location = { $regex: location, $options: "i" };
      if (category) query.category = category;

      const result = await jobCollection.find(query).toArray();
      res.send(result);
    });

    // GET single job by id
    app.get("/jobs/:id", async (req, res) => {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return res
          .status(400)
          .send({ success: false, error: "Invalid job ID." });
      }
      const result = await jobCollection.findOne({ _id: new ObjectId(id) });
      if (!result) {
        return res
          .status(404)
          .send({ success: false, error: "Job not found." });
      }
      res.send({ success: true, result });
    });

    // DELETE job by id
    app.delete("/jobs/:id", async (req, res) => {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return res
          .status(400)
          .send({ success: false, error: "Invalid job ID." });
      }
      const result = await jobCollection.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        return res
          .status(404)
          .send({ success: false, error: "Job not found." });
      }
      res.send({ success: true, result });
    });

    // GET featured jobs
    app.get("/featured-jobs", async (req, res) => {
      const result = await jobCollection
        .find({
          category: { $in: ["Design", "Marketing", "Technology"] },
        })
        .sort({ created_at: -1 })
        .limit(8)
        .toArray();
      res.send(result);
    });

    // GET latest jobs
    app.get("/latest-jobs", async (req, res) => {
      const cursor = jobCollection.find().sort({ created_at: -1 }).limit(8);
      const result = await cursor.toArray();
      res.send(result);
    });

    // GET jobs by logged-in user email
    app.get("/my-jobs", async (req, res) => {
      const { email } = req.query;
      if (!email || !isValidEmail(email)) {
        return res
          .status(400)
          .send({ success: false, error: "Valid email is required." });
      }
      const result = await jobCollection
        .find({ postedByEmail: email })
        .toArray();
      res.send(result);
    });

    // POST create new job
    app.post("/jobs", validateJob, async (req, res) => {
      const data = req.body;
      const result = await jobCollection.insertOne(data);
      res.send({
        success: true,
        result,
      });
    });

    // POST submit application
    app.post("/applications", validateApplication, async (req, res) => {
      const data = req.body;
      const result = await applicationCollection.insertOne(data);
      res.send({
        success: true,
        result,
      });
    });

    // GET applications
    app.get("/applications", async (req, res) => {
      const company = req.query.company;
      if (company) {
        const result = await applicationCollection
          .find({ company: company })
          .sort({ appliedAt: -1 })
          .toArray();
        res.send(result);
      } else {
        const result = await applicationCollection.find().toArray();
        res.send(result);
      }
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running fine");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
