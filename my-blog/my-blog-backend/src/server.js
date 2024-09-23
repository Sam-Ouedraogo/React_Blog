import { db, connectToDb } from "./db.js";
import express from "express";
import fs from "fs";
import Admin from "firebase-admin";

const credentials = JSON.parse(fs.readFileSync("./credentials.json"));

Admin.initializeApp({
  credential: Admin.credential.cert(credentials),
});

// import { MongoClient } from "mongodb"; //Allows connection to the mongo database

// let articlesInfo = [
//   {
//     name: "learn-react",
//     upvotes: 0,
//     comments: [],
//   },
//   {
//     name: "learn-node",
//     upvotes: 0,
//     comments: [],
//   },
//   {
//     name: "mongodb",
//     upvotes: 0,
//     comments: [],
//   },
// ];

const app = express();

//When the request has a json payload, parese and make it avalable on req.body
app.use(express.json()); //must be above endpoint definition

//Prevent multiple upvotes
//In order to add a middleware, pass func takes sae request arg as handler and necxt callback func

app.use(async (req, res, next) => {
  const { authtoken } = req.headers;

  if (authtoken) {
    try {
      req.user = await Admin.auth().verifyIdToken(authtoken);
    } catch (e) {
      res.sendStatus(400);
    }
  }

  next(); //This ensures that the execution proiceeds to the route handlers
});

//This is after adding the mongodb
app.get("/api/articles/:name", async (req, res) => {
  const { name } = req.params; //getting value of the URL paramameter
  const { uid } = req.user;
  //   const client = new MongoClient("mongodb://127.0.0.1:27017"); //(127.0.0.1)=> localhost :(27017) port this line creates an instance of client
  //   await client.connect(); //connects the client
  //   const db = client.db("react-blog-db"); //get the specific database recently created
  const article = await db.collection("articles").findOne({ name }); //Access the specific collection and selects the article based on the URL parameter
  if (article) {
    const upvoteIds = article.upvoteIds || [];
    article.canUpvote = uid && !upvoteIds.includes(uid);
    res.json(article); //Sends the response back to the client
  } else {
    res.sendStatus(404).send("Article nodt found");
  }
});
// app.post("/hello", (req, res) => {
//   res.send(`Hello, ${req.body.name}`);
// });

// app.get("/hello/:name", (req, res) => {
//   const { name } = req.params; //req.params returns an object with all the information in the URL parameter "name" => const name = req.params.name
//   res.send(`Hello ${name}!!`);
// });

//Creating upvote endpoint
// app.put("/api/articles/:name/upvote", (req, res) => {
//   const { name } = req.params;
//   const article = articlesInfo.find((a) => a.name === name);
//   if (article) {
//     article.upvotes += 1;
//     res.send(`The ${name} article now has ${article.upvotes} upvotes.`);
//   } else {
//     res.send("That article doesn't exist.");
//   }
// });

app.use((req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.sendStatus(401);
  }
});

//Creating upvote endpoint
app.put("/api/articles/:name/upvote", async (req, res) => {
  const { name } = req.params;
  const { uid } = req.user;

  const article = await db.collection("articles").findOne({ name });

  if (article) {
    const upvoteIds = article.upvoteIds || [];
    const canUpvote = uid && !upvoteIds.includes(uid);

    if (canUpvote) {
      //   const db = client.db("react-blog-db"); //get the specific database recently created
      await db
        .collection("articles")
        .updateOne(
          { name },
          { $inc: { upvotes: 1 }, $push: { upvoteIds: uid } }
        ); //update the upvotes count
    }

    //   const client = new MongoClient("mongodb://127.0.0.1:27017"); //(127.0.0.1)=> localhost :(27017) port this line creates an instance of client
    //   await client.connect(); //connects the client

    const updatedArticle = await db.collection("articles").findOne({ name }); //Access the specific collection and selects the article based on the URL parameter
    //if (article) {
    //res.send(`The ${name} article now has ${article.upvotes} upvotes.`);
    res.json(updatedArticle);
  } else {
    res.send("That article doesn't exist.");
  }
});

// app.post("/api/articles/:name/comments", (req, res) => {
//   const { name } = req.params;
//   const { postedBy, text } = req.body;

//   const article = articlesInfo.find((a) => a.name === name);

//   if (article) {
//     article.comments.push({ postedBy, text });
//     res.send(article.comments);
//   } else {
//     res.send("That article doesn't exist");
//   }
// });

app.post("/api/articles/:name/comments", async (req, res) => {
  const { name } = req.params;
  //const { postedBy, text } = req.body;
  const { yexy } = req.body;
  const { email } = req.user;

  //   const client = new MongoClient("mongodb://127.0.0.1:27017"); //(127.0.0.1)=> localhost :(27017) port this line creates an instance of client
  //   await client.connect(); //connects the client
  //   const db = client.db("react-blog-db"); //get the specific database recently created

  await db
    .collection("articles")
    .updateOne({ name }, { $push: { comments: { postedBy: email, text } } });

  const article = await db.collection("articles").findOne({ name });

  if (article) {
    //res.send(article.comments);
    res.json(article);
  } else {
    res.send("That article doesn't exist");
  }
});

connectToDb(() => {
  console.log("Connect to database successful");
  app.listen(8000, () => {
    console.log("Server listening on port 8000");
  });
});
