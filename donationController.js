const db = require("../config/db");

exports.addDonation = (req,res)=>{

 const {
  donorName,
  foodType,
  quantity,
  location,
  district,
  availableFrom,
  availableTo,
  notes
} = req.body;

 db.query(
  `INSERT INTO donations
  (donorName,foodType,quantity,location,district,
  availableFrom,availableTo,notes)
  VALUES(?,?,?,?,?,?,?,?)`,
  [
   donorName,
   foodType,
   quantity,
   location,
   district,
   availableFrom,
   availableTo,
   notes
  ],
  (err,result)=>{

   if(err) return res.status(500).json(err);

   res.json({
    message:"Donation Added"
   });

  }
);
};

exports.getDonations=(req,res)=>{

 db.query(
  "SELECT * FROM donations",
  (err,result)=>{

   if(err) return res.status(500).json(err);

   res.json(result);

  }
 );

};