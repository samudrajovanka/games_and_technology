const express = require('express');
const router = express.Router();

//item Model
const Account = require('../../models/Account');

// @route   GET api/Accounts
// @desc    Get All Accounts
// @acess   Public
router.get('/', (req,res) =>{
    Account.find()
        .sort({date: -1})
        .then(accounts => res.json(accounts))
});

// @route   POST api/account
// @desc    Create An Account
// @acess   Public

router.post('/', (req,res) =>{
    const newAccount = new Account({
        email: req.body.email ,

        password: req.body.password
    });
    newAccount.save().then(account => res.json(account));
});

// @route   DELETE api/account:id
// @desc    DELETE An Account
// @acess   Public
router.delete('/:id', (req,res) =>{
    Item.findById(req.params.id)
    .then(account => account.remove().then(() => res.json(("Account berhasil dihapus"))))
    .catch(err => res.status(400).json(("Account gagal dihapus")));
});


module.exports = router;