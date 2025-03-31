if(process.env.NODE_ENV != "production"){
    require("dotenv").config();

}
const express = require("express");
const methodoveride=require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const User = require("./models/user.js");
const flash = require('connect-flash');

const app = express();
const {isLoggedIn}=require("./middleware.js");


const multer = require("multer");  
const { storage } = require("./cloudconfig.js"); 
const upload = multer({ storage }); 
const passport = require("passport");
const localStrategy = require("passport-local");
const session = require("express-session");
const { error } = require("console");

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodoveride("_method"));

//Database connection
const mongoose_Url='mongodb://127.0.0.1:27017/E-commerce';
async function main(){
    await mongoose.connect(mongoose_Url);
}
main().then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log("error:", err);
})


// Session implemetation
const sessionoptio={
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires:new Date(Date.now() + 7 * 24 * 60 * 60 *1000),
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure:false,
    },
};
app.use(session(sessionoptio));
app.use(flash());


// User detail save implemenation
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});


//Listing Rout
app.get("/",(req,res)=>{
    res.render("./listing/home.ejs");
})

//Create new Book
app.get("/listing/New",isLoggedIn,(req,res)=>{
    res.render("./listing/new.ejs");
})
app.post("/listing", upload.single("image"), async (req, res) => { 
    try {
        const { title, author, description, price } = req.body;
        const newListing = new Listing({
            title,
            author,
            description,
            price,
            image: {
                url: req.file.path,   
                filename: req.file.filename, 
            },
        });
        await newListing.save();
        req.flash("success","Add New Book !")
        res.redirect("/listing");
    } catch (error) {
        console.error("Error saving listing:", error);
        res.status(500).send("Error uploading listing");
    }
});


// //index rout
app.get("/listing", async (req, res) => {
    try {
        let listings = await Listing.find({}); // Fetch data from MongoDB
        res.render("listing/index", { listings }); 
    } catch (error) {
        console.error("Error fetching listings:", error);
        res.status(500).send("Server Error");
    }
});

//showt rout
app.get("/listing/:id", async (req, res) => {
    try {
        let { id } = req.params;
        let listing = await Listing.findById(id);
        res.render("./listing/show.ejs",{listing})
    } catch (error) {
        console.error("Error fetching listing:", error);
        res.status(500).send("Server Error");
    }
});

//Update rout
app.get("/listing/:id/edit",isLoggedIn,async(req,res)=>{
    let {id}=req.params;
    try{
        let listing=await Listing.findById(id);
        res.render("./listing/edit.ejs",{listing})
    }catch(err){
        console.error("Error fetching listing:", err);
        res.status(500).send("Server Error");
    }
});
app.put("/listing/:id",upload.single("image"),async(req,res)=>{
    try{
    let {id}=req.params;
    let {title,author,description,price}=req.body;
    let listing=await Listing.findByIdAndUpdate(id, {
        title,
        author,
        description,
        price,   
    });
    if(typeof req.file != "undefined"){
        let url= req.file.path;   
        let filename= req.file.filename;
        listing.image={url,filename}
        await listing.save();
    }
    req.flash("success", "Book Details Updated !");
    res.redirect("/listing");
    }catch(err){
        console.error("Error fetching listing:", err);
        res.status(500).send("Server Error");
    }

});

//deleter listing
app.delete("/listing/:id",isLoggedIn,async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Book Deleted !");
    res.redirect("/listing");
})

//User Router

//User Sinup
app.get("/users/signup",async (req,res)=>{
    res.render("./users/signup");
})
app.post("/users", async (req, res) => {
    try {
        let listing  = req.body.listing;
        let {password } = listing;
        let newUser = new User(listing);
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser,(err)=>{
            if(err){
                return req.next(err)
            }
        req.flash("success","User Sinup Successful !")
        res.redirect("/listing");
        })
        
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

//Login User
app.get("/users/Login",(req,res)=>{
    res.render("./users/login");
})
app.post("/users/login", 
    passport.authenticate('local',{ 
        failureRedirect: '/users/login', failureFlash:true
    }),
async(req,res)=>{
  req.flash("success","Welcome My Shop!");
  res.redirect("/listing");
});


app.get("/logout",(req,res)=>{
    req.logOut((err)=>{
        if(err){
            return req.next(err);
        }
        req.flash("success", "Logout successfull");
        res.redirect("/listing");
    })
})
app.get("/users/:id",async(req,res)=>{
    let {id}=req.params;
    const user=await User.findById(id);
    res.render("./users/show.ejs", {user});
});

app.post("/users/edit/:id", async (req, res) => {
    try {
        let { id } = req.params; 
        let userData = req.body.user; 
        let updated = await User.findByIdAndUpdate(id, userData);
        req.flash("success", "User updated successfully");
        res.redirect("/listing");
    } catch (err) {
        console.error(err);
        res.status(500).send("Some error: " + err.message);
    }
});


app.listen(8080,()=>{
    console.log("server is listern to port 8080");
});

