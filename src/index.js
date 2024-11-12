// Main imports
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import recipeRoutes from "./routes/manageRecipes.js";
import { connectDB } from "./lib/mongo.js";
import functions from "firebase-functions";

const port = 3001;
const app = express();

app.use(bodyParser.json());
app.use(cors());

async function run() {
  try {
    await connectDB();

    app.use("/api", recipeRoutes);

    app.listen(port, () => {
      console.log(`Server is online at http://localhost:${port}`);
    });
  } catch(error) {
    console.log(error);
  }
}
run().catch(console.dir);

export const api = functions.https.onRequest(app);