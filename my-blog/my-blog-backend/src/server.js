import { db, connectToDb } from "./db.js";
import express from "express";
import fs from "fs";
import Admin from "firebase-admin";

const credentials = JSON.parse(fs.readFileSync("./credentials.json"));

Admin.initializeApp({
  credential: Admin.credential.cert(credentials),
});

const app = express();

app.use(express.json()); //must be above endpoint definition

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

  const article = await db.collection("articles").findOne({ name }); //Access the specific collection and selects the article based on the URL parameter
  if (article) {
    const upvoteIds = article.upvoteIds || [];
    article.canUpvote = uid && !upvoteIds.includes(uid);
    res.json(article); //Sends the response back to the client
  } else {
    res.sendStatus(404).send("Article nodt found");
  }
});

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

    const updatedArticle = await db.collection("articles").findOne({ name }); //Access the specific collection and selects the article based on the URL parameter

    res.json(updatedArticle);
  } else {
    res.send("That article doesn't exist.");
  }
});

app.post("/api/articles/:name/comments", async (req, res) => {
  const { name } = req.params;
  //const { postedBy, text } = req.body;
  const { text } = req.body;
  const { email } = req.user;

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
