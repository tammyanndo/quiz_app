// load .env data into process.env
require("dotenv").config();

// Web server config
const PORT = process.env.PORT || 8080;
const sassMiddleware = require("./lib/sass-middleware");
const express = require("express");
const app = express();
const morgan = require("morgan");


// PG database client/connection setup
const { Pool } = require("pg");
const dbParams = require("./lib/db.js");
const db = new Pool(dbParams);
db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan("dev"));

app.set("view engine", "ejs");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['QUIZZAPP'],
  maxAge: 24 * 60 * 60 * 1000,
}));


app.use(
  "/styles",
  sassMiddleware({
    source: __dirname + "/styles",
    destination: __dirname + "/public/styles",
    isSass: false, // false => scss, true => sass
  })
);

app.use(express.static("public"));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const usersRoutes = require("./routes/users");
const widgetsRoutes = require("./routes/widgets");

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/api/users", usersRoutes(db));
app.use("/api/widgets", widgetsRoutes(db));
// Note: mount other resources here, using the same pattern above

// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).

//HELPER FUNCTION (to be moved into helper folder)
const confirmUser = function (email, password) {
  return findUserByEmail(email)
    .then(function (res) {
      const userFound = res[0]
      if (!userFound) {
        return false
      };
      if (userFound) {
        const result = (password === userFound.password)
        if (!result) {
          return false;
        } else {
          return userFound
        }
      }
    })

};

const findUserByEmail = function (email) {
  const sqlQuery = `
    SELECT *
    FROM users
    WHERE email = $1;
    `

  return db.query(sqlQuery, [email])
    .then((dbRes) => dbRes.rows)
    .catch((err) => console.log(err));
};

app.get("/api/quizzes", (req, res) => {
  const sqlQuery = `
  SELECT quizzes.title, users.name
  FROM quizzes
  JOIN users ON users.id = user_id
  ;
  `

  db.query(sqlQuery)
    .then((dbRes) => {
      const templateVars = {
        user: {
          name: undefined
        },
        quizzes: dbRes.rows
      }
      console.log("dbRes", dbRes)
      res.render("index", templateVars)
      console.log(dbRes.rows);

    });
  });

  app.get("/api/users", (req, res) => {
    const sqlQuery = `
  SELECT *
  FROM users
  ;
  `
  db.query(sqlQuery)
    .then((dbRes) => res.json(dbRes.rows))
    .catch((err) => console.log(err));
});

const userEmailExists = function (email, templateVar) {
  templateVar.users.forEach(element => {
    //  console.log(element["email"]);
    if (element["email"] === email) {
      return true;
    } else {
      return false;
    }
  });
};
/*
const getSessionId = function (sqlQuery1, email) {
  let session_id = db.query(sqlQuery1)
    .then(data => {
      const templateVar = { users: data.rows };
      templateVar.users.forEach(element => {
        console.log(element["email"], email, element["id"]);
        if (element["email"] == email) {
          console.log(element["id"]);
          return element["id"];
        }
      });
    })

    .catch((err) => console.log(err))

  return session_id;
};
*/
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    res.status(400).send("Invalid email or password!");
  }
  const sqlQuery1 = `SELECT * FROM users`;
  const sqlQuery = `
  INSERT INTO
    users(name, email, password)
  VALUES
    ($1, $2, $3)
  RETURNING *
  `;

  db.query(sqlQuery1)
    .then(data => {
      const templateVar = { users: data.rows, user_id: req.session.user_id };
      console.log(templateVar);
      if (userEmailExists(email, templateVar)) {
        res.status(400).send("Email is already registered!");
      } else {
        db.query(sqlQuery, [name, email, password])
          .then(data => {
            //req.session.user_id = getSessionId(sqlQuery1, email);
            db.query(sqlQuery1)
              .then(data => {
                const templateVar = { users: data.rows };
                templateVar.users.forEach(element => {
                  //       console.log(element["email"], email, element["id"]);
                  if (element["email"] == email) {
                    console.log(element["id"]);
                    req.session.user_id = element["id"];
                  }
                });
                console.log("POST got session " + req.session.user_id);
                res.redirect("/quizzes");
              })


          })
      }
    }
    )
    .catch((err) => console.log(err));
});

  // app.post("/new_quiz", (req, res) => {
  //   const {title, description, isPrivate} = req.body
  //   const user_id =
  //   const sqlQuery = `
  //   INSERT INTO
  //     quizzes(title, description, isPrivate)
  //   VALUES
  //     ($1, $2, $3, $4)
  //   RETURNING *
  //   `
  //   db.query(sqlQuery, [user_id, title, description, isPrivate])
  //     .then(() => )
  //     .catch((err) => console.log(err))
  // })

  // app.post("/new_question", (req, res) => {
  //   const
  // })



  app.get("/", (req, res) => {
    const user = req.session.user_id
    const templateVars = {
      user
    }

    res.redirect("/quizzes", templateVars);

  });

  app.get("/quizzes", (req, res) => {

    const sqlQuery = `
  SELECT quizzes.title, users.name
  FROM quizzes
  JOIN users ON users.id = user_id
  ;
  `

    db.query(sqlQuery)
      .then((dbRes) => {
        console.log("req.session.user:", req.session.user_id)
        const templateVars = {
          quizzes: dbRes.rows,
          user: req.session.user_id

        }
        res.render("index", templateVars)
        console.log("deRes.rows:", dbRes.rows);


      })
      .catch((err) => console.log(err));
  })


  app.get("/newquiz", (req, res) => {
    const user = req.session.user_id
    const templateVars = {
      user
    }
    res.render("createQuiz", templateVars);
  });

  app.post("/newquiz"), (req, res) => {



  }

  app.get("/login", (req, res) => {
    const user = null
    const templateVars = {
      user
    }
    res.render("login", templateVars);
  });

  app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;


    // use helper function to confirm that email is found in db, and if so, the password matches
    confirmUser(email, password)
    .then((user) => {
      console.log("user:", user)
          // if there is a user (true), then create a cookie, otherwise return error message
    if (user) {
      req.session.user_id = user;
      res.redirect("/quizzes");
    } else {
      res.status(403).send('Status code 403: Login error. Please try again.');
    }
    })

  })

  app.post("/logout", (req, res) => {
    req.session = null;

    res.redirect("/");
  });

  app.get("/register", (req, res) => {
    const user = req.session.user_id
    const templateVars = {
      user
    }
    console.log("Gsession " + req.session.user_id);
    console.log("Gparams " + req.params.user_id);

    db.query(`
  SELECT * FROM users;`)
      .then(data => {
        const templateVar = { users: data.rows, user_id: req.session.user_id };
        //  console.log(templateVar);
        if (templateVar.users[0].id === req.session.user_id) {
          console.log("Already registered");
          res.render("register");
        } else {
          console.log("Register new user");
          res.render("register", templateVars);
        }
      })
  });



  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
  });

