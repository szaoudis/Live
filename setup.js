const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const http = require("http");
const server = http.createServer(app);
const path = require("path");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('views'));

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "views/index.html"));
});

app.post("/room", function(req, res) {
    console.log(JSON.parse(JSON.stringify(req.body)));
    res.sendFile(path.join(__dirname, "views/index.html"));
    res.send(req.body);
})

server.listen(3000);