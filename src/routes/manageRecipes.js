import express from "express";
import { client } from "../lib/mongo.js";

const router = express.Router();

const db = client.db("primarydb");
const collection = db.collection("recipes");

// Get 20 recipes from collection
router.get("/", async (req, res) => {
  const recipes = await collection.find({}).toArray();
  if (recipes) {
    res.status(200).send(recipes);
  } else {
    res.status(404).send("No recipes found");
  }
});

// Get recipes by cuisine
router.get("/cuisine/:name", async (req, res) => {
  const cuisine = req.params.name;

  const recipes = await collection.find({ cuisine: cuisine }).toArray();

  if (recipes) {
    res.status(200).send(recipes);
  } else {
    res.status(404).send("No recipes found");
  }
});

// Get top 4 recipes (most requests)
router.get("/popular", async (req, res) => {
  const recipes = await collection
    .find({})
    .sort({ requests: -1 })
    .limit(4)
    .toArray();

  if (recipes) {
    res.status(200).send(recipes);
  } else {
    res.status(404).send("No recipes found");
  }
});

// Get recipes by similar name
router.get("/search/:name", async (req, res) => {
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
router.get("/search/single/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  const recipe = await collection.findOne({ id: id });
  await collection.updateOne({ id: id }, { $inc: { requests: 1 } });

  if (recipe) {
    res.status(200).send(recipe);
  } else {
    res.status(404).send("No recipe found");
  }
});

// Add a new recipe
router.post("/addNew", async (req, res) => {
  try {
    const { title, image, cuisine, summary, instruction } = req.body;

    // Check if required fields are provided
    if (!title || !image || !cuisine || !summary || !instruction) {
      return res.status(400).send("All fields are required");
    }

    // Find the highest ID in the collection
    const highestIdRecipe = await collection.find().sort({ id: -1 }).limit(1).toArray();
    const newId = highestIdRecipe.length > 0 ? highestIdRecipe[0].id + 1 : 1; // Start from 1 if collection is empty

    // Split instruction string into array
    const instructionArray = instruction.split(",").map(step => step.trim());

    const newRecipe = {
      id: newId,
      title: title,
      image: image,
      cuisine: cuisine,
      summary: summary,
      instruction: instructionArray,
      requests: 0 // Initialize request count to 0
    };

    // Insert the new recipe into the collection
    const result = await collection.insertOne(newRecipe);

    if (result.insertedId) {
      res.status(201).send("Recipe added successfully");
    } else {
      res.status(500).send("Failed to add recipe");
    }
  } catch (error) {
    res.status(400).send("An error occurred while adding the recipe");
  }
});


export default router;
