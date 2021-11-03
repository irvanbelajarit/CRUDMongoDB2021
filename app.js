const express = require("express");

const app = express();
const port = 3000;

//method override
const methodOverride = require("method-override");

//require session cookies
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

//configurasi connect flash message
app.use(cookieParser("secrect"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

//use method override
app.use(methodOverride("_method"));

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

//template engine
const expressLayouts = require("express-ejs-layouts");
app.set("view engine", "ejs");
app.use(expressLayouts);

//mongodbdatabase
require("./config/db");
const Contact = require("./model/contact");

//validasi express validator
const { body, check, validationResult } = require("express-validator");
const { rawListeners } = require("./model/contact");
const { isValidObjectId } = require("mongoose");

app.get("/", (req, res) => {
  res.render("index", { title: "halaman home", layout: "layouts/main-layout" });
});

app.get("/contact", async (req, res) => {
  const contacts = await Contact.find();

  res.render("contact", {
    title: "contact ejs",
    contacts,
    layout: "layouts/main-layout",
    msg: req.flash("msg"), //untuk menampilkan data pesan
  });
});

app.get("/contact/add", (req, res) => {
  res.render("tambah-data", {
    title: "Tambah data kontak",
    layout: "layouts/main-layout",
  });
});

app.post(
  "/contact",
  [
    body("nama").custom(async (value) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (duplikat) {
        throw new Error("nama contact sudah digunakan!");
      }
      return true;
    }),
    check("email", "Email tidak valid").isEmail(),
    check("nohp", "No HP tidak valid!").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("tambah-data", {
        title: "form tambah data kontak",
        layout: "layouts/main-layout",
        errors: errors.array(),
      });
    } else {
      Contact.insertMany(req.body, (error, result) => {
        req.flash("msg", "Data Berhasil Ditambahkan!"); //untuk menambahkan flash message
        res.redirect("/contact");
      });
    }
  }
);

app.get("/contact/edit/:id", async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  res.render("edit-data", {
    title: "edit data",
    contact,
    layout: "layouts/main-layout",
  });
});

// app.post(
//   "/contact/update",
//   [
//     body("nama").custom(async (value) => {
//       const duplikat = await Contact.findOne({ nama: value });
//       if (duplikat) {
//         throw new Error("nama contact sudah digunakan!");
//       }
//       return true;
//     }),
//     check("email", "Email tidak valid").isEmail(),
//     check("nohp", "No HP tidak valid!").isMobilePhone("id-ID"),
//   ],
//   (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       res.render("tambah-data", {
//         title: "form Edit data kontak",
//         layout: "layouts/main-layout",
//         errors: errors.array(),
//       });
//     } else {
//       Contact.updateOne(
//         { _id: req.body._id },
//         {
//           $set: {
//             nama: req.body.nama,
//             email: req.body.email,
//             nohp: req.body.nohp,
//           },
//         }
//       ).then((result) => {
//         req.flash("msg", "Data kontak berhasil Diubah!");
//         res.redirect("/contact");
//       });
//     }
//   }
// );

app.put(
  "/contact",
  [
    body("nama").custom(async (value) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (duplikat) {
        throw new Error("nama contact sudah digunakan!");
      }
      return true;
    }),
    check("email", "Email tidak valid").isEmail(),
    check("nohp", "No HP tidak valid!").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("tambah-data", {
        title: "form Edit data kontak",
        layout: "layouts/main-layout",
        errors: errors.array(),
      });
    } else {
      Contact.updateOne(
        { _id: req.body._id },
        {
          $set: {
            nama: req.body.nama,
            email: req.body.email,
            nohp: req.body.nohp,
          },
        }
      ).then((result) => {
        req.flash("msg", "Data kontak berhasil Diubah!");
        res.redirect("/contact");
      });
    }
  }
);

// app.get("/contact/delete/:id", (req, res) => {
//   Contact.findByIdAndDelete(req.params.id).then((result) => {
//     req.flash("msg", "Data Berhasil Dihapus!"); //untuk menambahkan flash message

//     res.redirect("/contact");
//   });
// });

app.delete("/contact", (req, res) => {
  Contact.findByIdAndDelete(req.body.id).then((result) => {
    req.flash("msg", "Data Berhasil Dihapus!"); //untuk menambahkan flash message
    res.redirect("/contact");
  });
});

app.listen(port, () => {
  console.log(`server berjalan pada port ${port}`);
});
