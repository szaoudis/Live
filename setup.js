const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const app = express();
const http = require("http");
const server = http.createServer(app);
const path = require("path");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('views'));

let videos = [];

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "views/index.html"));
});

app.post("/room", function(req, res) {
    console.log(JSON.parse(JSON.stringify(req.body.filename)));
    videos.push(JSON.parse(JSON.stringify(req.body.filename)));
    res.send(req.body);
});

app.get("/video", function(req, res) {
    const range = req.headers.range;
    if(!range) {
        res.status(400).send("Requires Range header");
    }

    const videoSize = fs.statSync(`${videos[0]}.mp4`).size;

    const CHUNK_SIZE = 10 ** 6;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4"
    };

    res.writeHead(206, headers);

    const videoStream = fs.createReadStream(`${videos[0]}.mp4`, {start, end});

    videos.shift();
    videoStream.pipe(res);
});

server.listen(3000);