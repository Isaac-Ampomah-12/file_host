// JS script here
const express = require('express');
const zip = require('express-zip');
const app = express();

// const bodyParser = require('body-parser');
// const { extname, resolve } = require('path');

const uploadLib = require('express-fileupload');

const port = process.env.PORT || 8080;

const nodemailer = require("nodemailer");

const cors = require("cors");
app.use(
  cors({
      origin: "https://asdyyu.herokuapp.com"
      // "http://127.0.0.1:5502",
      // methods: ["GET", "POST", "PUT", "DELETE"]
  })
)
//  Import dbConnection
const db = require('./dbConnection');

app.use(uploadLib());
app.use(express.json());  // accept data in json format
app.use(express.urlencoded({ extended: true})); // decode data from the HTML form

//imports
// const multer = require('multer');
// const { check, validationResult } = require('express-validator');
// const { timeLog } = require('console');
// const uuid = require('uuid').v4;

// set the view engine to ejs
// app.use(express.static( __dirname + `/public`));
// app.set('views', './public');
// app.set('view engine', 'ejs');
// const urlencodedParser = bodyParser.urlencoded({ extended: false });


// const storage = multer.diskStorage({
//   destination: (req, file, cb) =>{
//     cb(null, './uploads/');
//   },
//   filename: (req, file, cb) => {
//     const { originalname } = file;
//     cb(null, `${uuid()}-${originalname}`);
//   }
// });
// const upload = multer({ storage: storage });


// login page
// app.get('', function(req, res) {
//   res.render('Login');
// });

// app.get('/Register', function(req, res) {
//     res.render('Register');
//   });

//   app.get('/Login', function(req, res) {
//     res.render('Login');
//   });

//   app.get('/FeedPage', function(req, res) {
//     res.render('feedPage');
//   });

//   app.get('/Index', function(req, res) {
//     res.render('index');
//   });

//   app.get('/ForgetPassword', function(req, res) {
//     res.render('ForgetPassword');
//   });

// index page
/*
app.post('/login', function(req, res) {
  res.redirect('/Index');
}); */


// Users Section

// Login
app.post('/login', 
// urlencodedParser, 
// [
//   check('username', 'This username must be 3+ characters long')
//       .exists()
//       .isLength({ min: 3 }),
//   check('email', 'Email is not valid')
//       .isEmail(),
//   check('password', 'Invalid password').isLength({ min: 7 })

// ], 
async (req, res) => {
    const {email, password} = req.body;

    console.log(email, password);

    const query = `SELECT * FROM users WHERE email = "${email}" AND password = "${password}" `;

    await db.all(query, (err, rows) => {
      if(err) return console.error(err.message);

      // if (rows.length === 0){
          // res.json("Invalid user");
      //     console.log("Invalid User");
      // }else{
      //     // res.json(rows);
          console.log(rows);
          res.json(rows);
          // res.render('index');
      // }
  });

});


// Sign UP
app.post('/signUp', 
// urlencodedParser, 
// [
//   check('username', 'This username must be 3+ characters long')
//       .exists()
//       .isLength({ min: 3 }),
//   check('email', 'Email is not valid')
//       .isEmail(),
//   check('password', 'Invalid password').isLength({ min: 7 })

// ], 
async (req, res) => {
    // const errors = validationResult(req)
    // if(!errors.isEmpty()) {
      //return res.status(422).jsonp(errors.array())
    //   const alert = errors.array();

    //   res.render('Register', {alert});
    // }
    //res.redirect('/Register');git remote -v
    
    const {username, email, password} = req.body;
    console.log(username, email, password);
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
   
    await db.run(
        query,
        [username, email, password],
        async (err) => {
            if(err) return console.error(err.message);

            console.log("User added successfully");
            res.json("User added successfully");
            // res.redirect('/Login');
        }
    );

    // res.redirect('/Login');
  });

  // Forgot Password
app.post('/forgotPassword', 
  // urlencodedParser, 
  // [
  //   check('username', 'This username must be 3+ characters long')
  //       .exists()
  //       .isLength({ min: 3 }),
  //   check('email', 'Email is not valid')
  //       .isEmail(),
  
  // ], 
  async (req, res) => {
      // const errors = validationResult(req)
      // if(!errors.isEmpty()) {
        //return res.status(422).jsonp(errors.array())
        // const alert = errors.array();


        const {email} = req.body;
        console.log(email);

        const query = `SELECT * FROM users WHERE email = "${email}"`;

        await db.all(query, async (err, rows) => {
          if(err) return console.error(err.message);
          console.log(rows.length);
          if (rows.length === 0){
              res.json("Invalid user");
              console.log("Invalid User");
          }else{
              // res.json(rows);
              // console.log(rows);

              let transporter = nodemailer.createTransport({
                // https://ethereal.email/
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                  user: 'gardner.littel10@ethereal.email', // generated ethereal user
                  pass: 'wuAQHdZaRu7Q7XcBqv', // generated ethereal password
                },
              });
            
              const msg = {
                from: '"The File Server" <info@fileserver.com>', // sender address
                to: `${email}`, // list of receivers
                subject: "Reset Password", // Subject line
                text: `Copy and paste https://asdyyu.herokuapp.com/templates/resetpassword.html?email=${email} into your browser in order to rest your password`, // plain text body
                
              };
              // send mail with defined transport object
              let info = await transporter.sendMail(msg);
            
              console.log("Message sent: %s", info.messageId);
              // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            
              // Preview only available when sending through an Ethereal account
              console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        
              console.log('Email Sent');
              res.json('Email sent');
              // res.render('index');
          }
      });

        // res.render('ForgetPassword', {alert});
      // }
  });

  // Reset Password
  app.post('/resetPassword', async (req, res) => {
    const {email, newPassword, confirmPassword} =req.body;
    console.log(email,newPassword, confirmPassword);
    if (newPassword === confirmPassword && email !== undefined){
      const query = `UPDATE users SET password = "${newPassword}" WHERE email = "${email}"`;
   
      await db.run(
          query,
          async (err) => {
              if(err) return console.error(err.message);

              const query = `SELECT * FROM users WHERE email = "${email}" `;

              await db.all(query, (err, rows) => {
                if(err) return console.error(err.message);
          
                // if (rows.length === 0){
                    // res.json("Invalid user");
                //     console.log("Invalid User");
                // }else{
                //     // res.json(rows);
                    console.log(rows);
                    res.json(rows);
                    // res.render('index');
                // }
            });
              // console.log("Password Reset Successful");
              // // res.redirect('/index');
              // res.json("Password Reset Successful");
             
          }
      );
    } else {
      console.log("Passwords do not match");
      res.json("Passwords do not match");
    }
 
  });

  // Files Section

  // File Upload
  app.post('/fileUpload',
    // urlencodedParser, 
  //  upload.single('upload'), 
   async (req, res) => {
     console.log("hello");
     // res.redirect('/Index');
     const {title, description} = req.body;
     console.log(title, description);
     console.log(req.files);
     if (req.files){
      console.log(req.files);
      
      var file = req.files.upload;
      var filename = file.name;
      file.mv("./uploadedFiles/"+filename, async (err) => {
          if (err){
              console.log(err);
              res.send("error occured");
          }
          else{
            const query = 'INSERT INTO files (title, description, fileName) VALUES (?, ?,?)';
   
            await db.run(
                query,
                [title, description, filename],
                (err) => {
                    if(err) return console.error(err.message);
                    console.log("File added successfully");
                    // res.json("User added successfully");
                    res.json("File added successfully");
                   //  res.redirect('/Login');
                }
            );
              // res.send("Done!");
          }
      });
  }
    //  const {title, description} = req.body;
    // console.log(title, description);


    //  res.json(req.body);
  });

  //Get All files

app.get('/allFiles', async (req, res) => {
  const query = `SELECT * FROM files`;

  await db.all(query, (err, rows) => {
    if(err) return console.error(err.message);

    res.json(rows);

    // console.log(rows.length);

    // if (rows.length === 0){
    //     res.json("No file");
    //     console.log("No file");
    // }else{
    //     res.json(rows);
    //     console.log(rows);
    //   //  res.render('index', {items} );
    // }
  });
});

  // file Search
  // urlencodedParser,
  app.post('/fileSearch',  async function(req, res) {
    const {search} = req.body;
    console.log(search);
    const query = `SELECT * FROM files WHERE title LIKE "%${search}%" AND description LIKE "%${search}%" `;

    await db.all(query, (err, rows) => {
      if(err) return console.error(err.message);
      // console.log(rows.length);
      console.log(rows);
      res.json(rows);

      // if (rows.length === 0){
      //     res.json("No such file");
      //     console.log("No such file");
      // }else{
      //     res.json(rows);
          
      //   //  res.render('index', {items} );
      // }
  });
   

  });



  // File Download
  app.get("/fileDownload", async (req, res) => {
    console.log("here");
      const file = req.query;
      const fileName = file.fileName;
      console.log(fileName);
      res.zip([
        {path: `./uploadedFiles/confirm.png`, name: `${fileName}`}
    ]);

    // console.log(req.body);

  //   const {fileId} = req.body;

  //   const query = `SELECT fileName FROM files WHERE fileId = ${fileId}`;

  // await db.all(query, (err, rows) => {
  //   if(err) return console.error(err.message);
    
    
  //   rows.forEach(row => {
  //     console.log(row);
      
  //     const fileName = row.fileName;
  //     console.log(fileName);
  //     res.json(fileName);

    //   res.zip([
    //     {path: `./uploadedFiles/${fileName}`, name: `${fileName}`}
    // ]);

  //   });

  // });
  });


  //email files
  app.post('/fileEmail', async (req, res) => {
    const {fileId, recepientEmail} = req.body;
    console.log(fileId, recepientEmail);
    let fileName = "";
    const query = `SELECT fileName FROM files WHERE fileId = ${fileId}`;

    await db.all(query, async(err, rows) => {
      if(err) return console.error(err.message);
      // console.log(rows.length);
      rows.forEach(row => {
        fileName = row.fileName;
      });

      let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: 'gardner.littel10@ethereal.email', // generated ethereal user
          pass: 'wuAQHdZaRu7Q7XcBqv', // generated ethereal password
        },
      });

      const msg = {
        from: '"The File Server" <info@fileserver.com>', // sender address
        to: `${recepientEmail}`, // list of receivers
        subject: "Reset Password", // Subject line
        text: "Please find attatch your a file", // plain text body
        attachments: [
          {   // file on disk as an attachment
            filename: `${fileName}`,
            path: `./uploadedFiles/${fileName}` // stream this file
          }
        ]
      };
      // send mail with defined transport object
      await transporter.sendMail(msg, async (err, info) => {
        if (err) console.error(err.message);

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        const query = `INSERT INTO emails (emailFile, emailAddr) VALUES (?,?)`;
        console.log(recepientEmail);
        await db.run(
          query,
          [fileId,recepientEmail],
          (err) => {
              if(err) return console.error(err.message);
              console.log('File sent');
              res.json('File sent');
          }
        );
        
      })
    });
  });

  //file emailed count
  app.post('/fileEmailCount', async (req, res) => {
    const {fileId} = req.body;
    console.log(fileId);
    const query = `SELECT count(*) AS fileCount FROM emails WHERE emailFile = ${fileId}`;

    await db.all(query, (err, rows) => {
      if(err) return console.error(err.message);
          
      rows.forEach(row => {
        console.log(row);
        res.json(row);
      });
    
    });
  });



app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
 });
