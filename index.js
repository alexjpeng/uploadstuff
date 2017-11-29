const express = require("express");
const morgan = require("morgan");
const path = require("path");
const fileUpload = require("express-fileupload");
const ls = require("ls");
const querystring = require("querystring");
const basicAuth = require("basic-auth");
require('dotenv').config()

const app = express();
app.use(morgan("dev"));
app.use(fileUpload());
app.set("view engine", "pug");
app.use("/static", express.static(path.join(__dirname, "static")));

const fileDB = {};

const getExtension = filename => filename.split(".").reverse()[0];

const authValid = credentials => {
	return credentials && credentials.name == process.env.AUTH_USERNAME && credentials.pass == process.env.AUTH_PASSWORD
}

const authMiddleware = () => (req, res, next) => {
	const credentials = basicAuth(req);
	console.log('i got here');

	if (authValid(credentials)) {
		req.auth = credentials;
		next()
	} else {
		res.statusCode = 401
		res.setHeader('WWW-Authenticate', 'Basic realm="example"')
		const files = getFiles();
		res.render("list", { files, message: "Username or password is not correct", messageType: "danger" });
	}
}

const userMiddleware = () => (req, res, next) => {
	const credentials = basicAuth(req);
	if (authValid(credentials)) {
		req.auth = credentials;
		next();
	} else {
		next();
	}
}

const getFiles = () => {
	return ls("./uploads/*")
		.map(file => {
			console.log(file);
			return Object.assign({}, file, {
				extension: getExtension(file.file),
				encodedName: querystring.escape(file.file),
				timestamp: (fileDB[file.file] || {}).timestamp
			});
		});
}

var fs = require('fs');
var dir = './uploads';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

app.post("/upload", userMiddleware(), (req, res) => {
	const uploadFile = req.files.uploadFile;
	const auth = req.auth;
	if (uploadFile === undefined) {
		const files = getFiles();
		res.render("list", { files, message: "No file selected", messageType: "danger", auth });
	} else {
		uploadFile.mv(`./uploads/${uploadFile.name}`, (err) => {
			if (err) {
				console.log(err);
				const files = getFiles();
				res.render("list", { files, message: "File Error", messageType: "danger", auth });
			} else {	
				fileDB[uploadFile.name] = {
					timestamp: (new Date).toString()
				}
				const files = getFiles();
				res.render("list", { files, message: "File Uploaded", messageType: "success", auth });
			}
		});
	}
});


app.get("/", userMiddleware(), (req, res) => {
	const files = getFiles();
	const auth = req.auth;
	res.set("cache-control", "private, max-age=0, no-cache, no-store")
	res.render("list", { files, auth });
});

app.get("/uploads/:name", (req, res) => {
	res.sendFile(path.join(__dirname, "uploads", req.params.name))
});

app.get("/files/:filename/delete", authMiddleware(), (req, res) => {
	const filename = req.params.filename;
	fs.unlinkSync(`./uploads/${filename}`);
	const auth = req.auth;
	const files = getFiles();
	res.render("list", { files, message: `Deleted ${filename}`, messageType: "success", auth });
})

app.get("/files/:filename", (req, res) => {
	const file = getFiles()
		.filter(file => file.file == req.params.filename)[0];
	res.render("filePage", { file })
});

app.get("/login", authMiddleware(), (req, res) => {
	res.redirect("/");
});

app.get("/filedb", (req, res) => {
	res.send(fileDB);
})
app.listen(process.env.PORT || 8080);