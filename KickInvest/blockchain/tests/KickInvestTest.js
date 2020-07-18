const { KickInvest } = require('../../app/src/scripts/KickInvest.js');

let k = new KickInvest();

k.loadConfig('kickinvest-cfg.json');

k.addAccountToWallet('0xf8e9adc5b55989814c3f02272c12fb5b344cac9b0cb8c6530294e3f9b7bacc56', 'test');
k.listWallet().then((wallet) =>{
    console.log(wallet);
})


k.listProjects().then(e=>console.log(e));
// k.getRemoteAccount().then((e) => console.log("Accounts: " + e));