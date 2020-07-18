let Web3 = require("web3");
let fs = require("fs");
let gov_abi = require('E:/Work/kickinvest/blockchain/pykickinvest/Governor.json');
let proj_abi = require('E:/Work/kickinvest/blockchain/pykickinvest/Project.json');
let transfer_abi = require('E:/Work/kickinvest/blockchain/pykickinvest/Transfer.json');

let w3 = new Web3("http://127.0.0.1:8545/");

// INPUT la fiecare restart
let account = "0xfB2B0a64558a65858A6ACFE237bF40Bee679a1c4";         // un Available account, dupa executarea `ganache-cli`
let acc2 = "0xe1BB89fD4e007E4609a33dCd5117b64a4918121E";
let governor_addr = "0xF8F16928F9F0a0eA714C231F9f65ecA839Edc3D1";   // contract address de la `Deploying 'Governer'`, dupa executarea `truffle migrate`


let contract = new w3.eth.Contract(gov_abi, governor_addr);


// Get contract address of newly created Project
function getProjectAddress(transactionHash, cb) {
    contract.getPastEvents('NewProject').then((eventArray) => {
        eventArray.forEach(element => {
            if (element.transactionHash == transactionHash) {
                console.log("[PROJECT] Found address: " + element.returnValues['contract_addr']);
                cb(element.returnValues['contract_addr']);
            }
        });
    });
}

var projectContract;
// Test Project contract
function testProjectContract(addr) {
    projectContract = new w3.eth.Contract(proj_abi, addr);
    projectContract.methods.invest().send({ from: account, gas: 1500000, value: 100000 })
    // .then(function(tx) {
    //     getTransferAddress(projectContract, tx.transactionHash, testTransferContract)
    // });
}

// Get transfer address from project
function getTransferAddress(tr, transactionHash, cb) {
    tr.getPastEvents('NewInvestor').then((eventArray) => {
        eventArray.forEach(element => {
            if (element.transactionHash == transactionHash) {
                console.log("[TRANSFER] Found address: " + element.returnValues['investor']);
                cb(element.returnValues['investor']);
            }
        });
    });
}

var investContract;
// Test Transfer contract
function testTransferContract(addr) {
    // let investContract = new w3.eth.Contract(transfer_abi, addr);
    investContract = new w3.eth.Contract(transfer_abi, addr);

    // console.log("[e:" + investContract.methods);
}

// New project
contract.methods.new_project().send({ from: account, gas: 1500000 })
    .then(function (tx) {
        getProjectAddress(tx.transactionHash, testProjectContract);
    });