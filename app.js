const express = require("express")
const app = express();
const mongoose = require("mongoose")

function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

app.use(express.static("views"))

app.set("view engine", "ejs");
app.use(express.urlencoded({
	extended: true
}))

mongoose.connect("mongodb+srv://hary4065:test123@cluster0.rdzwn.mongodb.net/todoDB")

// Blueprint/schema of document
const itemSchema = {
	name: String
}

// Document based on blueprint/schema
const item = mongoose.model("Item", itemSchema);

const item1 = new item({
	name: "Welcome to To Do list."
})

const item2 = new item({
	name: "Hit the + button top add new item."
})

const item3 = new item({
	name: "<-- Hit This to delete an item."
})

const defaultItems = [item1, item2, item3];


let work = [];

//Showing List
app.get("/", (req, res) => {
	item.find({}, function (err, items) {
		if (items.length == 0) {
			item.insertMany(defaultItems, function (err) {
				if (err)
					console.log(err);
				else
					console.log("Success");
			})
			res.redirect("/")
		} else
			res.render("index", {
				listTitle: "Today",
				newItems: items
			});
	})
});

const listSchema = {
	name: String,
	items: [itemSchema]
}

const List = mongoose.model("List", listSchema)

// Deleting an Entry
app.post("/delete", (req, res) => {
	const listName = req.body.listName;

	if (listName === "Today") {
		item.findOneAndDelete({
			_id: req.body.check
		}, function (err) {
			if (err)
				console.log(err);
			else
				console.log("Deleted");
		})
		res.redirect("/");
	} else {
		List.findOneAndUpdate({
			name: listName
		}, {
			$pull: {
				items: {
					_id: req.body.check
				}
			}
		}, function (err, result) {
			if (!err)
				res.redirect("/" + listName);
			else
				console.log(err);
		})
	}
});


//Custom list creation
app.get("/:id", (req, res) => {
	const listName = capitalize(req.params.id);
	List.findOne({
		name: listName
	}, function (err, result) {
		if (!err)
			if (!result) {
				// Create New List
				const list = new List({
					name: listName,
					items: defaultItems
				});
				list.save();
				res.redirect("/" + listName);
			}
		else {
			res.render("index", {
				listTitle: listName,
				newItems: result.items
			})
		}
	});
})

// Creating A new Entry
app.post("/", (req, res) => {
	const listName = req.body.list
	const newItem = new item({
		name: req.body.newItem
	})

	if (listName === "Today") {
		newItem.save();
		res.redirect("/")
	} else {
		List.findOne({
			name: listName
		}, function (err, result) {
			if (!err) {
				result.items.push(newItem);
				result.save();
				res.redirect("/" + listName);
			}
		})
	}
});



app.post("/work", (req, res) => {
	work.push(req.body.newItem)
	res.redirect("/work")
});

// About
app.get("/about", (req, res) => {
	res.render("about");
})

app.listen(3000, () => console.log("Server Started"))