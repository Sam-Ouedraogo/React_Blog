import { MongoClient } from "mongodb"; //Allows connection to the mongo database

let db;

async function connectToDb(cb) {
  const client = new MongoClient("mongodb://127.0.0.1:27017"); //(127.0.0.1)=> localhost :(27017) port this line creates an instance of client
  await client.connect(); //connects the client
  db = client.db("react-blog-db"); //get the specific database recently created
  cb();
}

export { db, connectToDb };
