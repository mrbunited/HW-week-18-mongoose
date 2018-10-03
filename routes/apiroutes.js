
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

//     // Save these results in an object
//     results.push({
//       title: title,
//       link: link
//     });
//   });

  if (title && link) {

    db.scrapedArticles.insert({
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
    db.scrapedArticles.find({}, function(error, found) {
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