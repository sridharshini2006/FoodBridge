const db = require("../config/db");

exports.verifyDonor=(req,res)=>{

 const id=req.params.id;

 db.query(
  "UPDATE users SET verified=1 WHERE id=?",
  [id],
  (err,result)=>{

   if(err) return res.status(500).json(err);

   res.json({
    message:"Donor Verified"
   });

  }
 );
};

exports.deleteDonation=(req,res)=>{

 const id=req.params.id;

 db.query(
  "DELETE FROM donations WHERE id=?",
  [id],
  (err,result)=>{

   if(err) return res.status(500).json(err);

   res.json({
    message:"Donation Deleted"
   });

  }
 );
};