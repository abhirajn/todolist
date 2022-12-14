//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://abhin:test123@cluster0.ogrx9ma.mongodb.net/todolist2", { useNewUrlParser: true });

// mongoose schema
const itemsSchema = {
  name: String
};

// mongoose model
const Item = mongoose.model("Item", itemsSchema);

//mongoose document
const Item1 = new Item({
  name: "Welcome"
});

const Item2 = new Item({
  name: "Hit + button to add a task"
});

const Item3 = new Item({
  name: "-- click this to delete a task"
});

const defaultItems = [Item1, Item2, Item3];

//mongoose schema
const listschema = {
  name: String,
  items: [itemsSchema]
};

//mongoose model
const List = mongoose.model("List", listschema);


app.get("/", function (req, res) {
  console.log("started");
  // Item.insertMany(defaultItems);
  // const day = date.getDate();
  Item.find({}, function (err, foundItems) {

    if (foundItems.lenght == 0) {
      console.log("empty")
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("successfully saved default items to db");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "TOday", newListItems: foundItems });
    }


  });



});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if (listName === "TOday") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });

  }


});

app.post("/delete", function (req, res) {
  const checkedItemId = (req.body.checkbox);
  const listName = req.body.listName;

  if (listName === "TOday") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        console.log("succesfully deleted");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundItems) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }


});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  console.log(customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        console.log("here")
        //create a new list 
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        console.log("here")
        res.redirect("/" + customListName);
      }
      else {
        //show existing list
        console.log("in else")
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    }

  });


});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
