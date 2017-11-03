const express = require("express");
const morgan = require("morgan");
const path = require("path");
const fileUpload = require("express-fileupload");
const ls = require("ls");

const app = express();
app.use(morgan("dev"));
app.use(fileUpload());
app.set("view engine", "pug");

const getFiles = () => {
	return ls("./uploads/*");
}

app.post("/upload", (req, res) => {
	console.log(req.files);
	const uploadFile = req.files.uploadFile;
	uploadFile.mv(`./uploads/${uploadFile.name}`, (err) => {
		if (err) {
			res.send(err)
		} else {
			res.redirect("/?msg=file+uploaded");
		}
	});
});


app.get("/", (req, res) => {
	const message = req.query.msg;
	const files = getFiles();
	console.log(files);
	res.render("list", { files, message });
});

app.get("/uploads/:name", (req, res) => {
	res.sendFile(path.join(__dirname, "uploads", req.params.name))
});

app.listen(8080);
