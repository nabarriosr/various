'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const fs = require('fs');
const web3 = require('web3');
const Tx = require('ethereumjs-tx').Transaction;
const md5 = require('md5');

//MongoDB

const app = express();
var complaintSchemaJSON = {
    complaintText: String,
    email: String,
    timeStamp: Number,
    isBlockchainReg: Boolean
}
mongoose.connect('mongodb://localhost/denuncias', { useNewUrlParser: true, useUnifiedTopology: true });
var complaint_Schema = new Schema(complaintSchemaJSON);
var Complaint = mongoose.model("logs", complaint_Schema);

//Web3

var Web3 = new web3(new web3.providers.HttpProvider('url'));
var myAddress = 'myaddress';
var privateKey = Buffer.from('key', 'hex')
var contractABI = JSON.parse(fs.readFileSync('ethereum/abi.json', 'utf8'));
var contractAddress = "contractAddress";
var contract = new Web3.eth.Contract(contractABI, contractAddress);



//Middleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "jade");



//Router

app.get("/complaint", function (req, res) {
    res.render("complaint");
})

app.post("/complaint", function (req, res) {
    var complaint = new Complaint({
        complaintText: req.body.complaintText,
        email: req.body.email,
        timeStamp: Date.now(),
        isBlockchainReg: true
    });
    Web3.eth.getTransactionCount(myAddress).then(function (v) {
        var count = v;
        var rawTransaction = {
            "from": myAddress,
            "gasPrice": Web3.utils.toHex(20 * 1e9),
            "gasLimit": Web3.utils.toHex(210000),
            "to": contractAddress,
            "value": "0x0",
            "data": contract.methods.set(String(complaint._id), md5(req.body.complaintText)).encodeABI(),
            "nonce": Web3.utils.toHex(count)
        }
        var transaction = new Tx(rawTransaction, { 'chain': 'ropsten' });
        transaction.sign(privateKey);
        Web3.eth.sendSignedTransaction(
            '0x' + transaction.serialize().toString('hex'),
            function (){
                complaint.save(function (){
                    res.send("Denuncia Enviada");
                });
            }
        );
        
    })
});

app.get('/query', function (req, res) {
    var ledgerQuery = [];
    var auxCount = 0;
    function ethQueryN(i,Count){
        contract.methods.get(i).call().then(
            function (out) {
                Complaint.findById(
                    out[0],
                    function (err, doc) {
                        ledgerQuery.push([i, doc.complaintText, doc.email, Date(doc.timeStamp), out[1] == md5(doc.complaintText)]);
                        auxCount++;
                        if (Count == auxCount) {
                            res.render("query", { ledgerQuery: ledgerQuery });
                        }
                    }
                );
            }
        );
    }
    contract.methods.count().call().then(
        function (outCount) {
            for (var i = 1; i <= outCount; i++) {
                ethQueryN(i, outCount);
            }
        }
    );
});

Complaint.find({},
    function(err,out){
        out.forEach((x)=>{
            console.log(x.complaintText);    
        })
        
    }

);


app.listen(1337);