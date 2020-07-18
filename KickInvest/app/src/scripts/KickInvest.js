import { EthFactory } from './Contracts';
import { EthDriver } from './EthDriver';
import Web3 from 'web3';

const crypto = require("crypto");

var fs;

if (window !== undefined && window.require !== undefined) {
    console.log("[*] [KickInvest] App is running inside an electron application...");
    fs = window.require('fs');
} else {
    fs = null;
}

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

export default class KickInvest {

    static _instance = null;

    constructor(cfgPath = null) {
        this.ethDriver = null;
        this.governor = null;
        this.projectContracts = [];
        this.nextProjectListUpdate = 0;
        this.kickInvestAccount = null;

        if (cfgPath) {
            this.loadConfig(cfgPath);
        }
    }

    static getInstance() {
        if (KickInvest._instance == null) {
            KickInvest._instance = new KickInvest();
        }
        return KickInvest._instance;
    }

    validateConfig(cfg) {
        if (!cfg.hasOwnProperty('address'))
            return false;

        if (!cfg.hasOwnProperty('governorAddress'))
            return false;

        if (!cfg.hasOwnProperty('abi'))
            return false;

        return true;

    }

    loadAbis(abiObject) {
        for (const [contractName, abi] of Object.entries(abiObject)) {
            EthFactory.setAbi(contractName, abi);
        }
    }

    connectToNode(address) {
        this.ethDriver = new EthDriver(address);
        // if(!this.ethDriver.isConnected()) {
        //     throw "Could not connect to " + address;
        // }
        EthFactory.setDriver(this.ethDriver);
    }

    readConfig(path) {
        const cfgJson = JSON.parse(fs.readFileSync(path));
        if (!this.validateConfig(cfgJson)) {
            throw new Error("Invalid config file provided.");
        }

        return {
            address: cfgJson.address,
            abi: cfgJson.abi,
            governorAddress: cfgJson.governorAddress
        };
    }

    loadConfig(path) {
        const cfg = this.readConfig(path);
        this.connectToNode(cfg.address);
        this.loadAbis(cfg.abi);
        this.governor = EthFactory.Governor.at(cfg.governorAddress);
    }

    async getCurrentAccountInfo() {
        const acc = this.ethDriver.getCurrentAccount();
        const balance = await this.ethDriver.getBalance(acc.address);
        return {
            name: acc.name,
            address: acc.address,
            balance: balance
        };
    }

    // Create new eth account
    createPrivateKey(entropy) {
        return this.ethDriver.createPrivateKey(entropy);
    }

    // Local wallet control
    saveWallet(file, password) {
        // Get an array of all private keys currently loaded.
        let savedData = {};
        savedData.version = "1.0";
        savedData.wallet = {
            name: this.ethDriver.getCurrentAccount().name,
            privateKey: this.ethDriver.getCurrentAccount().privateKey
        };

        // Serialize the array
        const savedDataBuffer = Buffer.from(JSON.stringify(savedData));

        // Encrypt the data
        const key = CryptoHelper.hash(password).substr(0, 32);
        const encryptedData = CryptoHelper.encrypt(key, savedDataBuffer);

        // Save encrypted data to file
        fs.writeFileSync(file, encryptedData);
    }

    async loadWallet(file, password) {
        // Read encrypted data from file
        // fs.exists
        const encryptedWallet = fs.readFileSync(file);
        // Decrypt & deserialize data
        const key = CryptoHelper.hash(password).substr(0, 32);
        let savedData;
        try {
            savedData = JSON.parse(CryptoHelper.decrypt(key, encryptedWallet).toString());
        }
        catch (e) {
            throw new Error("Wrong password");
        }

        this.login(savedData.wallet.privateKey);
    }

    async registerAccount(privateKey, name) {
        try {
            this.ethDriver.privatekeyToAccount(privateKey);
        }
        catch (e) {
            throw new Error("Invalid private key");
        }

        this.ethDriver.setCurrentAccount(privateKey, name);

        const accountAddress = await this.governor.createAccount(name);
        console.log(`New account registered at: ${accountAddress}`);
        this.kickInvestAccount = EthFactory.Account.at(accountAddress);
    }

    async login(privateKey) {
        let account;
        try {
            account = this.ethDriver.privatekeyToAccount(privateKey);
        }
        catch (e) {
            throw new Error("Invalid private key");
        }
        const addr = await this.governor.getAccount(account);

        console.log(addr);
        if (addr === "0x0000000000000000000000000000000000000000") {
            console.log("No registered account found for private key!");
            throw new Error("No account found");
        }
        else {
            console.log("Found account for " + account + ": " + addr);
            this.kickInvestAccount = EthFactory.Account.at(addr);
            this.kickInvestAccount.getName().then((name) => {
                this.ethDriver.setCurrentAccount(privateKey, name);
            });
        }
        return true;
    }

    // Project control
    async listProjects(update = false) {

        if (!update && this.projectContracts.length > 0 && this.nextProjectListUpdate > new Date().getTime()) {
            console.log("Getting cached results...");
            return this.projectContracts;
        }

        console.log("Fetching list of projects...");
        this.projectContracts = [];
        const projectList = await this.governor.getProjects();
        this.nextProjectListUpdate = new Date().getTime() + 240000; // update each 4 mins

        await Promise.all(projectList.map(async (projectAddress) => {
            let projectObject = EthFactory.Project.at(projectAddress);

            this.projectContracts.push({
                obj: projectObject,
                address: projectAddress,
                name: await projectObject.getName(),
                email: await projectObject.getEmail(),
                desc: await projectObject.getDescription(),
                imgsrc: await projectObject.getImg(),
                investors: await projectObject.getNumberOfInvestors(),
                account: await projectObject.getProjectAccount()
            });
        }));
        return this.projectContracts;
    }

    async listInvestedProjects() {
        const allProjects = await this.listProjects();
        const investedProjAddressList = await this.getInvestedProjects();
        let investedProjList = [];

        for (var i = 0; i < allProjects.length; ++i) {
            let obj = allProjects[i];
            if (investedProjAddressList.includes(obj.address)) {
                obj.investment = await this.kickInvestAccount.getInvestedSum(obj.address);
                investedProjList.push(obj);
            }
        }
        return investedProjList;
    }

    async listPersonalProjects() {
        const allProjects = await this.listProjects();
        const personalProjAddresssList = await this.getPersonalProjects();
        let personalProjList = []

        for (var i = 0; i < allProjects.length; ++i) {
            let obj = allProjects[i];
            if (personalProjAddresssList.includes(obj.address)) {
                personalProjList.push(obj);
            }
        }
        return personalProjList;
    }

    refreshProjects() {
        this.projectContracts = [];
    }

    async createProject(name, email, desc, img) {
        const projectAddress = await this.kickInvestAccount.createProject(name, email, desc, img);
        return projectAddress;
    }

    async getInvestedProjects() {
        if (this.kickInvestAccount)
            return this.kickInvestAccount.getInvestedProjects();
        return [];
    }

    async getPersonalProjects() {
        if (this.kickInvestAccount)
            return this.kickInvestAccount.getPersonalProjects();
        return [];
    }

    async investProject(project, sum) {
        if (!this.kickInvestAccount) {
            return;
        }

        return this.kickInvestAccount.invest(project, sum);
    }

    async listTransferList(project) {
        if (!this.kickInvestAccount) {
            return [];
        }

        const addressList = await project.getTransfers();
        let transferList = []
        for (var i = 0; i < addressList.length; ++i) {
            let transfer = EthFactory.Transfer.at(addressList[i]);
            let transferInfo = {
                obj: transfer,
                recipient: await transfer.getRecipient(),
                reason: await transfer.getReason(),
                value: await transfer.getValue(),
                ayeVotes: await transfer.getAyeVotes(),
                nayVotes: await transfer.getNayVotes(),
                votes: await transfer.getNumberOfVotes(),
                castVote: await transfer.getVote(this.kickInvestAccount.getAddress())
            };

            switch (await transfer.getTransferResult()) {
                case "0":
                    transferInfo.status = "active";
                    break;

                case "1":
                    transferInfo.status = "resolved";
                    break;

                case "2":
                    transferInfo.status = "rejected";
                    break;

                default:
                    break;

            }


            transferList.push(transferInfo);
        }
        return transferList.reverse();
    }

    castAye(transfer) {
        return this.kickInvestAccount.castAye(transfer);
    }

    castNay(transfer) {
        return this.kickInvestAccount.castNay(transfer);
    }

    removeVote(transfer) {
        return this.kickInvestAccount.removeVote(transfer);
    }

    checkVotes(transfer) {
        return this.kickInvestAccount.checkVotes(transfer);
    }

    removeTransfer(transfer) {
        return this.kickInvestAccount.removeTransfer(transfer);
    }

    async initTransfer(project, recipient, reason, value) {
        return this.kickInvestAccount.initTransfer(project, recipient, reason, value);
    }

    // Remote account control
    async createRemoteAccount() {
        this.governor.createAccount();
    }

    async getRemoteAccount(address = null) {
        return this.governor.getAccount(address);
    }

    async getRemoteAccounts() {
        this.listWallet().then((wallet) => {
            console.log("Wallet: " + wallet);
            wallet.forEach((account) => {
                this.getRemoteAccount(account.account).then((remoteAccount) => {
                    console.log("Name:" + account.name + " | Account: " + account.account + " | Remote account: " + remoteAccount);
                    this.kickInvestAccounts[account.account] = remoteAccount;
                });
            })
        })
    }
}

export class KickInvestUtil {
    static ethereumConverter(ammount) {
        let unit = 'wei';
        if (ammount > 100000) {
            unit = 'gwei';
            ammount /= 1000000000;
            if (ammount > 100000) {
                unit = 'Ξ';
                ammount /= 1000000000;
            }
        }
        return `${ammount} ${unit}`;
    }

    static isAddress(address) {
        return Web3.utils.isAddress(address);
    }
}