const express = require("express");
const morgan = require("morgan");
const path = require("path");
const fileUpload = require("express-fileupload");
const ls = require("ls");

const app = express();
app.use(morgan("dev"));
app.use(fileUpload());
app.set("view engine", "pug");

app.get("/form", (req, res) => {
	res.render("form");
});

app.post("/upload", (req, res) => {
	console.log(req.files);
	const uploadFile = req.files.uploadFile;
	uploadFile.mv(`./uploads/${uploadFile.name}`, (err) => {
		if (err) {
			res.send(err)
		} else {
			res.send("file uploaded")
		}
	});
});

app.get("/list", (req, res) => {
	const files = ls("./uploads/*");
	var fileNames = files.map(item => item.full); 
	console.log(fileNames);
	res.render("list", { files: fileNames });
});

app.get("/uploads/:name", (req, res) => {
	res.sendFile(path.join(__dirname, "uploads", req.params.name))
});

app.listen(8080);
