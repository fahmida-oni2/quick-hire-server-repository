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

async function run() {
  try {
    // await client.connect();
    const db = client.db("hire-db");
    const jobCollection = db.collection("jobs");
  

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
