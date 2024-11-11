// Main imports
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

// MongoDB imports
import { MongoClient, ServerApiVersion } from "mongodb";
const uri =
  "mongodb+srv://rupakyeware:nanu2003@primarycluster.remwl.mongodb.net/?retryWrites=true&w=majority&appName=PrimaryCluster";

const port = 3001;
const app = express();

app.use(bodyParser.json());
app.use(cors());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const db = client.db("primarydb");
const collection = db.collection("recipes");

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // Get 20 recipes from collection
    app.get("/", async (req, res) => {
      const recipes = await collection.find({}).toArray();
      if (recipes) {
        res.status(200).send(recipes);
      } else {
        res.status(404).send("No recipes found");
      }
    });

    // Get recipes by cuisine
    app.get("/cuisine/:name", async (req, res) => {
      const cuisine = req.params.name;

      const recipes = await collection.find({ cuisine: cuisine }).toArray();

      if (recipes) {
        res.status(200).send(recipes);
      } else {
        res.status(404).send("No recipes found");
      }
    });

    // Get top 4 recipes (most requests)
    app.get("/popular", async (req, res) => {
      const recipes = await collection
        .find({})
        .sort({ request: -1 })
        .limit(4)
        .toArray();

      if (recipes) {
        res.status(200).send(recipes);
      } else {
        res.status(404).send("No recipes found");
      }
    });

    // Get recipes by similar name
    app.get("/search/:name", async (req, res) => {
      const name = req.params.name;
      const recipes = await collection
        .find({ title: { $regex: name, $options: "i" } })
        .toArray();

      if (recipes) {
        res.status(200).send(recipes);
      } else {
        res.status(404).send("No recipes found");
      }
    });

    // Get recipe by id
    app.get("/search/single/:id", async (req, res) => {
      const id = parseInt(req.params.id);

      const recipe = await collection.findOne({ id: id });
      await collection.updateOne({ id: id }, { $inc: {request: 1} });

      if (recipe) {
        res.status(200).send(recipe);
      } else {
        res.status(404).send("No recipe found");
      }
    });

    app.listen(port, () => {
      console.log(`Server is online at http://localhost:${port}`);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
