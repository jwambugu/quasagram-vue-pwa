const express = require("express");

// Express config
const app = express();
const port = 3000;

// Get all posts
app.get("/posts", (req, res) => {
  const posts = [
    {
      caption: "Golden Gate Bridge",
      location: "San Francisco",
    },
    {
      caption: "London Eye",
      location: "London",
    },
  ];

  res.send({
    data: {
      posts,
    },
  });
});

console.log(`[*] App running on port ${port}`);

app.listen(port);
