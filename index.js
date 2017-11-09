const express = require("express");
const morgan = require("morgan");
const path = require("path");
const fileUpload = require("express-fileupload");
const ls = require("ls");

const app = express();
app.use(morgan("dev"));
app.use(fileUpload());
app.set("view engine", "pug");
app.use("/static", express.static(path.join(__dirname, "static")));

const getFiles = () => {
	return ls("./uploads/*");
}

var fs = require('fs');
var dir = './uploads';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

app.post("/upload", (req, res) => {
	console.log(req.files);
	const uploadFile = req.files.uploadFile;
	if (uploadFile === undefined) {
		const files = getFiles();
		res.render("list", { files, message: "No file selected", messageType: "danger" });
	} else {
		uploadFile.mv(`./uploads/${uploadFile.name}`, (err) => {
			const files = getFiles();
			if (err) {
				console.log(err);
				res.render("list", { files, message: "File Error", messageType: "danger" });
			} else {
				res.render("list", { files, message: "File Uploaded", messageType: "success" });
			}
		});
	}
});


app.get("/", (req, res) => {
	const files = getFiles();
	res.render("list", { files });
});

app.get("/uploads/:name", (req, res) => {
	res.sendFile(path.join(__dirname, "uploads", req.params.name))
});

app.listen(process.env.PORT || 8080);
