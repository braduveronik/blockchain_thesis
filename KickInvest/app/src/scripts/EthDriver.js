const Web3 = require("web3");

export class EthDriver {
    constructor(url) {
        this.w3 = new Web3(url);

        this.currentAccount = null;
    }

    isConnected() {
        return this.w3.currentProvider.connected;
    }

    createPrivateKey(entropy) {
        return this.w3.eth.accounts.create(entropy);
    }

    privatekeyToAccount(privateKey) {
        return this.w3.eth.accounts.privateKeyToAccount(privateKey).address;
    }

    async setCurrentAccount(privateKey, name) {
        const acc = this.w3.eth.accounts.privateKeyToAccount(privateKey);

        acc.name = name;
        this.currentAccount = acc;

        return acc;
    }

    getCurrentAccount() {
        return this.currentAccount;
    }

    getBalance(address = null) {
        if (address === null) {
            address = this.getCurrentAccount();
        }
        return this.w3.eth.getBalance(address);
    }

    async signAndCallMethod(contractAddress, contractFunction, value = 0, gasDelta = 0) {
        const functionAbi = contractFunction.encodeABI();

        let nonce;
        const w3 = this.w3;

        const account = this.getCurrentAccount().address;
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

        const tx = await this.currentAccount.signTransaction(txParams);

        const serializedTx = tx.rawTransaction;

        try {
            const res = await w3.eth.sendSignedTransaction(serializedTx);
            return res;
        } catch (e) {
            throw e;
        }

    }
}