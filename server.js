var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var cheerio = require("cheerio");
var request = require("request");
var path = require("path");
var mongojs = require("mongojs");
var PORT = process.env.PORT || 8080;

// Initialize Express
var app = express();

// Handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main"}));
app.set("view engine", "handlebars");
  
  // Routes
//   require("./routes/apiRoutes")(app);
//   require("./routes/htmlRoutes")(app);
// Configure middleware

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Database config
var databaseUrl = "mongoScrapper";
var collections = ["scrapedData"]
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});
// Require all models
var Article = require("./models/Article");
var Note = require("./models/Note");


app.get("/", function(req, res) {
    res.render(path.join(__dirname, "views/index.handlebars"));
  });


// Route for scrapper to populate db
app.get("/scrape", function(req, res) {
console.log("\n***********************************\n" +
            "Grabbing every thread name and link\n" +
            "\n***********************************\n");

request("https://www.nytimes.com/section/science", function(error, response, html) {

  // Load the HTML into cheerio and save it to a variable
  // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
  var $ = cheerio.load(html);

  // An empty array to save the data that we'll scrape
  var results = [];

  // With cheerio, find each p-tag with the "title" class
  // (i: iterator. element: the current element)
  $("h2.headline").each(function(i, element) {

    // Save the text of the element in a "title" variable
    var title = $(element).text();

    // In the currently selected element, look at its child elements (i.e., its a-tags),
    // then save the values for any "href" attributes that the child elements may have
    var link = $(element).children().attr("href");



  if (title && link) {

//     // Save these results in an object
    results.push({
      title: title,
      link: link
    });



    db.scrapedData.insert({
      title: title,
      link: link
    },
    function(err, inserted) {
      if (err) {
        // Log the error if one is encountered during the query
        console.log(err);
      }
      else {
        // Otherwise, log the inserted data
        console.log(inserted);
      }
    });

  console.log(results);
  res.render(path.join(__dirname, "views/found.handlebars"));

};
});
});
});

// Retrieve data from the db
app.get("/saved", function(req, res) {
    // Find all results from the scrapedData collection in the db
    db.scrapedData.find({}, function(error, found) {
      // Throw any errors to the console
      if (error) {
        console.log(error);
      }
      // If there are no errors, send the data to the browser as json
      else {
        res.json(found);
      }
    });
  });



app.post("/scrape", function(req, res) {
    Article.create(req.body)
      .then(function(dbPost) {
        res.json(dbPost);
      })
      .catch(function(err) {
        res.json(err);
      });
  });
  
  // Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/week18HW");