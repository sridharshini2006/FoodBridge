const db = require("../config/db");
const bcrypt = require("bcryptjs");

exports.registerUser = async (req, res) => {

 const { name, email, phone, district, password, role } = req.body;

 const hash = await bcrypt.hash(password, 10);
db.query(
  "INSERT INTO users(role,name,email,phone,district,password) VALUES(?,?,?,?,?,?)",
  [role, name, email, phone, district, hash],
  (err, result) => {
    if(err) return res.status(500).json(err);

    res.json({
      message: "Registration Successful"
    });
  }
);
};

exports.loginUser = (req,res)=>{

 const { email,password } = req.body;

 db.query(
   "SELECT * FROM users WHERE email=?",
   [email],
   async (err,result)=>{

     if(result.length===0){
       return res.status(400).json({
         message:"User Not Found"
       });
     }

     const user=result[0];

     const match=await bcrypt.compare(
       password,
       user.password
     );

     if(!match){
       return res.status(400).json({
         message:"Wrong Password"
       });
     }

     res.json({
       message:"Login Successful",
       user
     });
   }
 );
};