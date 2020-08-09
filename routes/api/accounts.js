const express = require('express');
const router = express.Router();

//item Model
const Account = require('../../models/Account');

// @route   GET api/items
// @desc    Get All items
// @acess   Public
router.get('/', (req,res) =>{
    Account.find()
        .sort({date: -1})
        .then(accounts => res.json(accounts))
});

// @route   POST api/items
// @desc    Create A Post
// @acess   Public

router.post('/', (req,res) =>{
    const newAccount = new Account({
        email: req.body.email
    },
    {
        password: req.body.password
    });
    newAccount.save().then(accounts => res.json(accounts));
});

// @route   DELETE api/items:id
// @desc    DELETE A Post
// @acess   Public
router.delete('/:id', (req,res) =>{
    Item.findById(req.params.id)
    .then(accounts => accounts.remove().then(() => res.json(("Account berhasil dihapus"))))
    .catch(err => res.status(400).json(("Account gagal dihapus")));
});


module.exports = router;