const express = require('express');
const router = express.Router();
const session = ('client-sessions');

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

// @route   POST api/account
// @desc    Create An Account
// @acess   Public
router.post('/', (req, res) => {
    const newAccount = new Account({
        email: req.body.email,

        password: req.body.password
    });
    newAccount.save().then(account => res.json(account));
});

router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    Account.findOne({ email: email }, (err, user) => {
        if (err) {
            console.log(err);
            return res.status(500).send();
        }
        if (!user) {
            return res.status(404).send();
        }

        user.comparePassword(password, (err, isMatch) => {
            if (isMatch && isMatch == true) {
                req.sessioncookie.user = user;
                console.log("Welcome...!");
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
router.delete('/:id', (req, res) => {
    Account.findById(req.params.id)
        .then(account => account.remove().then(() => res.json(("Account berhasil dihapus"))))
        .catch(err => res.status(400).json(("Account gagal dihapus")));
});

module.exports = router;