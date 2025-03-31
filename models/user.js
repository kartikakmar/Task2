const mongose=require("mongoose");
const Schema=mongose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");

const UserSchema=new Schema({
    name: {
        type:String,
        require:true,
    },
    email:{
        type:String,
        require:true,
        unique:true,
    },
    gender:{
        type:String,
        require:true
    },
    age:{
        type:Number,
        require:true,
    },
    mobileno:{
        type:Number,
        rquire:true,
        unique:true,
    },
    city:{
        type:String,
        require:true,
    },
    state:{
        type:String,
        require:true,
    },
    country:{
        type:String,
        require:true,
    },
    address:{
        type:String,
        require:true,
    },
    pincod:{
        type:Number,
        require:true  
    }

});
UserSchema.plugin(passportLocalMongoose);
const User=new mongose.model("User", UserSchema);
module.exports=User;