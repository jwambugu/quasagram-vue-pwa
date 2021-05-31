const express = require("express");
// const inspect = require("util").inspect;
const Busboy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { uuid } = require("uuidv4");
const cors = require("cors");

// Express config
const app = express();
const port = 3000;

app.use(cors());

//Firebase db
const { db, bucket } = require("./firebase");

// Get all posts
app.get("/posts", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  const posts = [];

  const docs = db.collection("posts").orderBy("createdAt", "desc").get();

  docs
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        doc.data().createdAt && posts.push({ ...doc.data(), id: doc.id });
      });

      res.send({
        data: {
          posts,
          status: 200,
        },
      });
    })
    .catch((err) => {
      console.log(err);
    });

  // docs.forEach((doc) => {
  //   doc.data().createdAt && posts.push({ ...doc.data(), id: doc.id });
  // });

  // const unsubscribe = doc.onSnapshot(
  //   (snap) => {
  //     snap.docs.forEach((doc) => {
  //       // Must wait for the server to create the timestamp & send it back
  //       // We don't want to edit data until it has done this
  //       doc.data().createdAt && posts.push({ ...doc.data(), id: doc.id });
  //
  //       console.log({ id: doc.id });
  //     });
  //
  //     res.send({
  //       data: {
  //         posts,
  //         status: 200,
  //       },
  //     });
  //   },
  //   (err) => {
  //     console.log(err.message);
  //   }
  // );
});

app.post("/create-post", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  const busboy = new Busboy({ headers: req.headers });

  const fields = {};
  let fileData = {};

  busboy.on("file", function (fieldName, file, filename, encoding, mimetype) {
    // Temp storage
    const filepath = path.join(os.tmpdir(), filename);

    file.pipe(fs.createWriteStream(filepath));

    fileData = {
      filepath,
      mimetype,
    };
  });

  busboy.on("field", function (fieldName, val) {
    fields[fieldName] = val;
  });

  busboy.on("finish", function () {
    const { filepath, mimetype } = fileData;
    const fileUUID = uuid();

    // Upload the image
    bucket.upload(
      filepath,
      {
        uploadType: "media",
        metadata: {
          metadata: {
            contentType: mimetype,
            firebaseStorageDownloadTokens: fileUUID,
          },
        },
      },
      (error, uploadedFile) => {
        if (error) {
          console.log(error);
          return;
        }

        const bucketName = bucket.name;
        const filename = uploadedFile.name;

        fields.imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${filename}?alt=media&token=${fileUUID}`;

        createDocument(fields);
      }
    );

    console.log(fileData);

    function createDocument(fields) {
      fields.createdAt = parseInt(fields.createdAt);

      // Add the post to firebase
      db.collection("posts")
        .add({
          ...fields,
        })
        .then((r) => {
          res.send({
            status: 200,
            message: "Post created successfully.",
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }

    // res.writeHead(303, { Connection: "close", Location: "/" });
    // res.end();
  });

  req.pipe(busboy);
});

console.log(`[*] App running on port ${port}`);

app.listen(process.env.PORT || port);
