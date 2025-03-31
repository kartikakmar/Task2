const Listing=require("./models/listing.js");

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","You must be logged in to any changes");
       return res.redirect("/users/login");
    }
    next()
}
