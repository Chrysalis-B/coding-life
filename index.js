const express = require("express");
const app = express();
const db = require("./db.js");
const animation = require("chalk-animation");
var multer = require("multer");
var uidSafe = require("uid-safe");
var path = require("path");
const s3 = require("./s3.js");
const config = require("./config");
const bodyParser = require("body-parser");

var diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

var uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2997152
    }
});

app.use(express.static("public"));

app.use(bodyParser.json());

app.get("/images", (req, res) => {
    db.getImages().then(results => {
        res.json({
            images: results.rows
        });
    });
});

app.get("/images/:id", (req, res) => {
    console.log(req.params.id);
    db
        .getMoreImages(req.params.id)
        .then(results => {
            res.json({
                images: results.rows
            });
        })
        .catch(function(err) {
            console.log("something went wrong while getting new images", err);
        });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    db
        .insertFormData(
            req.body.title,
            req.body.description,
            req.body.username,
            config.s3Url + req.file.filename
        )
        .then(function(results) {
            res.json({
                image: results.rows[0]
            });
        })
        .catch(function(err) {
            console.log(err);
        });
});

app.get("/image/:id", (req, res) => {
    Promise.all([
        db.getImageById(req.params.id),
        db.getCommentsByImageId(req.params.id)
    ])
        .then(function([imageresult, commentresult]) {
            if (!imageresult.rows[0].id) {
                res.json({
                    success: false
                });
            }
            res.json({
                image: imageresult.rows[0],
                comments: commentresult.rows,
                success: true
            });
        })
        .catch(function(err) {
            console.log(err);
            res.json({
                success: false
            });
        });
});

app.post("/comment", (req, res) => {
    db
        .insertComment(req.body.comment, req.body.username, req.body.imageId)
        .then(function(result) {
            res.json({
                comment: result.rows[0].comment,
                username: result.rows[0].username
            });
        });
});

app.listen(8080, () => animation.rainbow("Magic on port 8080"));
