const mongoose=require('mongoose');
const schema= new mongoose.Schema(
    {
        Firstname: {
            type: String,
            required: true
        },
        Lastname: {
            type: String,
            required: true
        },
        Email: {
            type: String,
            required: true
        },
        Password: {
            type: String,
            required: true
        }
    }
);

const userModel = mongoose.model("user",schema);
module.exports=userModel;