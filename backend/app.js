const express = require("express");

// Express config
const app = express();
const port = 3000;

//Firebase db
const db = require("./firebase");

// Get all posts
app.get("/posts", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  const posts = [];

  const doc = db.collection("posts").orderBy("createdAt", "desc");

  const unsubscribe = doc.onSnapshot(
    (snap) => {
      snap.docs.forEach((doc) => {
        // Must wait for the server to create the timestamp & send it back
        // We don't want to edit data until it has done this
        doc.data().createdAt && posts.push({ ...doc.data(), id: doc.id });
      });

      res.send({
        data: {
          posts,
        },
      });
    },
    (err) => {
      console.log(err.message);
    }
  );
});

console.log(`[*] App running on port ${port}`);

app.listen(process.env.PORT || port);
