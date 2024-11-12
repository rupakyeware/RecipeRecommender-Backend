import { MongoClient, ServerApiVersion } from "mongodb";
const uri =
  "mongodb+srv://rupakyeware:nanu2003@primarycluster.remwl.mongodb.net/?retryWrites=true&w=majority&appName=PrimaryCluster";

export const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export async function connectDB() {
  try {
    await client.connect();
  } catch (e) {
    console.log(e);
  }
}

export async function closeDB() {
  try {
    await client.close();
  } catch (e) {
    console.log(e);
  }
}
