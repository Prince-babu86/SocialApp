const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const usermodel = require("./models/user");
const postmodel = require("./models/post");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { title } = require("process");
const storymodel = require('./models/story');
const savedmodel = require('./models/Saved');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.get("/", (req, res) => res.render("index"));


app.get("/feed", Isloggedin, async function (req, res) {
  let user = await usermodel.findOne({ email: req.user.email });
  let post = await postmodel.find().populate("user");
  let users = await usermodel.find();
  res.render("feed", { post, user, users });
});

app.get("/profile", Isloggedin, async function (req, res) {
  let story = await usermodel.findOne({email:req.user.email}).populate('story');
  let user = await usermodel
    .findOne({ email: req.user.email })
    .populate("posts");
  res.render("profile", { user , story });
});



app.get("/login", function (req, res) {

  res.render("login");
});



// for save a post 

app.get('/Saved' , Isloggedin, async function(req,res){
  let user = await usermodel.findOne({email:req.user.email}).populate('savedpost');
  let post = await postmodel.find().populate('savedpostuser');

  res.render('savedpost' , {user , post});
  // res.send(user.savedpost);
 
})

app.post('/saved/:id' , Isloggedin, async function(req,res){
 let {id} = req.params
 let user = await usermodel.findOne({email:req.user.email})

 user.savedpost.push(id)
 await user.save()
 res.redirect('/feed');
})


app.post('/unsaved/:id' , Isloggedin, async function(req,res){
  let {id} = req.params
  let user = await usermodel.findOne({email:req.user.email})
 
 user.savedpost =  user.savedpost.filter(elem => elem.toString() !== id)
  await user.save()
  res.redirect('/feed');
 })
 


// for add a story function 

app.get('/Add-story' , function(req,res){
  res.render('saved')
})

app.post('/Add-Story' , Isloggedin , async function(req,res){
  let {storyTitle , storyImage , storyTags} = req.body
  let user = await usermodel.findOne({email:req.user.email}).populate('story')
  let story = await storymodel.create({
    user:user._id,
    storyTitle,
    storyImage,
    storyTags
  })
  user.story.push(story._id)
  user.save()
  res.redirect('/feed')
 
})


app.get('/Story/:id' , Isloggedin , async function(req,res){
  let Story =  await storymodel.findOne({_id:req.params.id}).populate('user');
  let user = await usermodel.findOne({email:req.user.email});
   res.render('storyview' , {Story , user});
});


// for show anyone account 

app.get('/profile/:username' , Isloggedin , async function(req,res){
 const userId = req.params.username
 const user = await usermodel.findById(userId).populate('posts').populate('story');
 res.render('userprofile' , {user});
})


// for delete function 

app.get('/delete/:id' ,Isloggedin , async function(req,res){
  let post = await postmodel.findOneAndDelete({_id:req.params.id});
  res.redirect('/profile')

})

app.get("/pin/:id", Isloggedin, async function (req, res) {
  let story = await postmodel.findOne({ _id: req.params.id }).populate("user");
  let post = await postmodel.find().populate("user");
  let user = await usermodel
    .findOne({ email: req.user.email })
    .populate("comments");
  console.log(story.user.username);
  res.render("story", { story, user , post });
});

app.get("/create", Isloggedin, async (req, res) => {
  let user = await usermodel.findOne({email:req.user.email})
  res.render("create" , {user});
});

app.post("/create", Isloggedin, async function (req, res) {
  let user = await usermodel.findOne({ email: req.user.email });
  let { title, description, postimage } = req.body;
  let post = await postmodel.create({
    user: user._id,
    title,
    description,
    postimage,
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/feed");
});

// for save a post 
app.get('/story/:id', Isloggedin , async function(req,res){
  let post = await postmodel.findOne({_id:req.params.id}).populate('user');
  console.log(post.title)
  res.render('saved');

})

// register account here
app.post("/register", async function (req, res) {
  let { username, email, password, image } = req.body;
  let user = await usermodel.findOne({ email, username });
  if (user) return res.status(500).send("User Already Created Account");
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await usermodel.create({
        username,
        password: hash,
        email,
        image,
      });
      let token = jwt.sign({ email: email, userid: user._id }, "shhhhhhh");
      res.cookie("token", token);
      res.redirect("/feed");
    });
  });
});

// for login account here
app.post("/login", async function (req, res) {
  let { email, password } = req.body;
  let user = await usermodel.findOne({ email });
  if (!user) return res.status(500).send("User Not found");
  //  console.log(user);
  bcrypt.compare(password, user.password, function (err, result) {
    if (result) {
      let token = jwt.sign({ email: email, userid: user._id }, "shhhhhhh");
      res.cookie("token", token);
      res.redirect("/feed");
    } else {
      res.redirect("/login");
    }
  });
});

// for
function Isloggedin(req, res, next) {
  if (req.cookies.token === "") res.redirect("/login");
  else {
    let data = jwt.verify(req.cookies.token, "shhhhhhh");
    req.user = data;
    next();
  }
}

// logout function
app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
