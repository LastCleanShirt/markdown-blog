#!/usr/bin/env node

/* 
 * [x] TODO: Render markdown to web using ejs and markdown library
 * [x] TODO: Set database with markdown string in it
 * [x] TODO: Upload markdown and login
 * [ ] TODO: Show Blog and Articles on index.ejs
 * [ ] TODO: Index.ejs code
 * [ ] TODO: Deploy to github pages
 * 
 * */

// Importing some libraries
const express = require("express");
const Datastore = require("nedb");
const bodyParser = require("body-parser");
const path = require("path");
const markdownHtml = require("markdown").markdown;
require("dotenv").config();

// App
const App = express();

// Nedb
const database = new Datastore("./database/database.db");
database.loadDatabase();

// Variable
const port = process.env.PORT || 3000;

// Use
App.use(bodyParser.urlencoded({ extended: true }));
App.use(bodyParser.json());
App.use(express.static("public"));

// Static directory
App.use(express.static(__dirname + "/public"));

// Set
App.set("views", path.join(__dirname, "public"));
App.set("view engine", "ejs");

// Index
App.get("/", function (req, res) {
	database.find({}, function (err, docs) {
		res.render("web/html/index", {
			data_: docs
		});
		// res.send({});
	});
});

// Blog
App.get("/blog/", async function (req, res) {
	/*const markdown_example = `# Example \n## Header `;
	
	const htmlcontent = markdownHtml.toHTML(markdown_example);
	
	res.render("web/html/blog", {
		blog: htmlcontent
	});*/
	
	database.find({ }, function (err, docs) {
		const doc = docs.filter(function (value) { return value.title === req.query.title; });
		const markdownconvertedhtml = markdownHtml.toHTML(doc[0]["markdowncode"]);
		
		console.log(doc);
		console.log(docs);
		
		res.render("web/html/blog", {
			markdowncontent: markdownconvertedhtml
		});
			
	});
	
});

// Upload
App.get("/upload", function (req, res) {
	res.render("web/html/upload", {});
	// res.send({});
	/*database.insert({
		markdowncode: "# Example \n## Header 2",
		title: "Example"
	});*/
});

App.post("/submitBlogArticle", function (req, res) {
	const markdowncode = req.body.markdowncode;
	const adminpassword = req.body.adminpassword;
	const title = req.body.title;
	/*console.log(markdowncode);
	console.log(adminpassword);
	console.log(title);*/
	if (adminpassword === process.env.ADMINPASSWORD) {
		// Insert to database
		database.find({ title: title }, function (err, docs) {
			// Finding title if exist then redirect
			if ( docs === {} ) {
				database.insert({
					title: title,
					markdowncode: markdowncode,
					link: "/blog?title=" + title
				});
				// res.write({});
				// res.end({});
				// res.writeHead(200);
				res.redirect("/blogAdded");
				// console.log("Blog added");
			} else {
				res.redirect("/titleExist");
				// console.log("Title Exist");
				// res.redirect("/");
			}
		});
	} else {
		res.redirect("/incorrectAdminPassword");
	}
});

// Title Exist
App.get("/titleExist", function (req, res) {
	res.render("web/html/titleExist", {});
});

// Blog Added
App.get("/blogAdded", function (req, res) {
	res.render("web/html/blogAdded", {});
});

// Incorrect Admin Password
App.get("/incorrectAdminPassword", function (req, res) {
	res.render("web/html/incorrectAdminPassword", {});
});

// Listen to port
App.listen(port, () => {
	console.log(`Listening to port ${port}`);
});
