const Web3 = require("web3");
const fs = require("fs");
const crypto = require("crypto");


// https://medium.com/@anned20/encrypting-files-with-nodejs-a54a0736a50a
const CryptoHelper = {
    defaultAlg: 'aes-256-ctr',

    encrypt: function (key, data, alg = this.defaultAlg) {
        const salt = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(alg, key, salt);
        return Buffer.concat([salt, cipher.update(data), cipher.final()]);
    },

    decrypt: function (key, data, alg = this.defaultAlg) {
        const salt = data.slice(0, 16);

        data = data.slice(16);

        const decipher = crypto.createDecipheriv(alg, key, salt);

        return Buffer.concat([decipher.update(data), decipher.final()]);
    },

    hash: function (data, alg = 'sha256', times = 13) {
        for (var i = 0; i < times; i++) {
            data = crypto.createHash(alg).update(data).digest('hex');
        }
        return data;
    }
}


class EthDriver {
    constructor(url) {
        this.w3 = new Web3(url);

        this.auth = null;
        this.selectedAccount = 0;
        this.wallet = []
    }

    isConnected() {
        return this.w3.currentProvider.connected;
    }

    authentificate(password) {
        this.auth = CryptoHelper.hash(password).substr(0, 32);
    }

    getWallet() {
        let addressArray = [];
        this.wallet.forEach((account) => {
            addressArray.push({
                name: account.name,
                account: account.address
            });
        });

        return addressArray;
    }

    addAccount(privateKey, name) {
        const acc = this.w3.eth.accounts.privateKeyToAccount(privateKey);
        acc.name = name;
        this.wallet.push(acc);
    }

    saveWallet(file) {
        // Get an array of all private keys currently loaded.
        let keysArray = [];
        this.wallet.forEach((account) => {
            keysArray.push({
                name: account.name,
                privateKey: account.privateKey
            });
        });

        // Serialize the array
        const walletStringBuffer = Buffer.from(JSON.stringify(keysArray));

        // Encrypt the data
        const encryptedWallet = Buffer.concat([Buffer.from('wal'), '\0', CryptoHelper.encrypt(this.auth, walletStringBuffer)]);

        // Save encrypted data to file
        fs.writeFileSync(file, encryptedWallet);
    }

    loadWallet(file) {
        // Read encrypted data from file
        // fs.exists
        const encryptedWallet = fs.readFileSync(file);

        // Decrypt & deserialize data
        const keysArray = JSON.parse(CryptoHelper.decrypt(this.auth, encryptedWallet).toString());

        // Load private keys
        keysArray.forEach((obj) => {
            this.addAccount(obj.privateKey, obj.name);
        });
    }

    getCurrentAccount() {
        return this.wallet[this.selectedAccount].address;
    }

    changeCurrentAccount(i) {
        if (i >= this.wallet.length) {
            throw "Out of bounds.";
        }
        this.selectedAccount = i;
    }

    getBalance(address = null) {
        if (address === null) {
            address = this.getCurrentAccount();
        }
        return this.w3.eth.getBalance(address);
    }

    async signAndCallMethod(contractAddress, contractFunction, value = 0, gasDelta = 0) {
        const functionAbi = contractFunction.encodeABI();

        let estimatedGas;
        let nonce;
        const w3 = this.w3;

        const account = this.getCurrentAccount();

        let gasAmount = await contractFunction.estimateGas({ from: account });
        gasAmount += Math.ceil(gasAmount * 0.15);
        // estimatedGas = gasAmount.toString(16);
        console.log("GAS: " + gasAmount);

        const _nonce = await w3.eth.getTransactionCount(account);
        nonce = _nonce.toString(16);

        const txParams = {
            to: contractAddress,
            // gas: 1500000,
            // gas: Math.ceil(gasAmount + gasAmount * 0.1),
            gas: gasAmount + gasDelta,
            nonce: '0x' + nonce,
            data: functionAbi,
            value: value
        };

        const tx = await this.wallet[this.selectedAccount].signTransaction(txParams);

        const serializedTx = tx.rawTransaction;

        return new Promise((resolve, reject) => {
            w3.eth.sendSignedTransaction(serializedTx).on('receipt', receipt => {
                // console.log("receipt: " + receipt);
                resolve(true);
            }).on('error', exc => {
                console.log(exc);
            });
        });
    }
}

exports.EthDriver = EthDriver;
