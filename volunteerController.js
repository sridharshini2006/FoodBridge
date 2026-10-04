const db = require("../config/db");

exports.assignVolunteer=(req,res)=>{

 const id=req.params.id;
 const { volunteer }=req.body;

 db.query(
  "UPDATE donations SET volunteer=? WHERE id=?",
  [volunteer,id],
  (err,result)=>{

   if(err) return res.status(500).json(err);

   res.json({
    message:"Volunteer Assigned"
   });

  }
 );

};

exports.updateStatus=(req,res)=>{

 const id=req.params.id;
 const { status }=req.body;

 db.query(
  "UPDATE donations SET status=? WHERE id=?",
  [status,id],
  (err,result)=>{

   if(err) return res.status(500).json(err);

   res.json({
    message:"Status Updated"
   });

  }
 );

};