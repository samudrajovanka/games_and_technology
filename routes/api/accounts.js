const express = require('express');
const router = express.Router();
const multer = require ('multer');

// LOCATION SAVING PHOTO FOR ACCOUNT
const accountStorage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null,'./accountphoto/');
    },
    filename: function(req, file, callback){
        callback(null, Date.now() + file.originalname)
    }
});

// FILTER FILE TYPE
const fileFilter = (req, file, callback) => {
    // ACCEPT A PHOTO
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        callback(null, true);
    }
    else {
    // REJECT A PHOTO
        callback(null, false);
    } 
}
// LIMIT PHOTO SIZE
const upload = multer({storage: accountStorage, limits: {
    fileSize: 1024 * 1024 * 5
},
fileFilter: fileFilter
});

//item Model
const Account = require('../../models/Account');

// @route   GET api/Accounts
// @desc    Get All Accounts
// @acess   Public
router.get('/', (req, res) => {
    Account.find()
        .sort({ date: -1 })
        .then(accounts => res.json(accounts))
});

// @route   REGISTER api/account
// @desc    Create An Account
// @acess   Public
router.post('/register', upload.single('accountImage'), (req, res) => {
        console.log(req.file);
        const newAccount = new Account({
        email: req.body.email,
        nickname: req.body.nickname,
        password: req.body.password,
        accountImage: req.file.path
    });
    newAccount.save().then(account => res.json(account));
});

// @route   POST api/account
// @desc    Login An Account
// @acess   Public
router.post('/login',(req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const nickname = req.body.nickname;

    Account.findOne({ email: email }, (err, user) => {
        if (err) {
            console.log(err);
            return res.status(500).send();
        }
        if (!user) {
            return res.status(404).send();
        }

        user.comparePassword(password, (err, isMatch) => {
            if (isMatch== true) {
                req.sessioncookie.user = user;
                console.log(`Welcome ${user.nickname}`);
                return res.status(200).send();

            }
            else {
                console.log("Invalid Email or Password...!");
                return res.status(400).send();
            }
        });
    })
});

// @route   DELETE api/account:id
// @desc    DELETE An Account
// @acess   Public
router.delete('/delete/:id', (req, res) => {
    
    Account.findById(req.params.id)
        .then(account => account.remove().then(() => res.status(400).json(("Account berhasil dihapus"))))
        .catch(err => res.status(400).json(("Account gagal dihapus")));
});

module.exports = router;