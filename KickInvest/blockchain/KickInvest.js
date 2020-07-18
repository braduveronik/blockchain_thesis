const fs = require('fs');

const { EthFactory } = require('../../../blockchain/Contracts.js');
const { EthDriver } = require('../../../blockchain/EthDriver.js');


class KickInvest {
    constructor(cfgPath = null) {
        this.ethDriver = null;
        this.governor = null;
        this.projectContracts = []

        if(cfgPath) {
            this.loadConfig(cfgPath);
        }
    }

    validateConfig(cfg) {
        if(!cfg.hasOwnProperty('address'))
            return false;
        
        if(!cfg.hasOwnProperty('governorAddress')) 
            return false;

        if(!cfg.hasOwnProperty('abi'))
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

    loadConfig(path) {
        const cfgJson = JSON.parse(fs.readFileSync(path));
        if(!this.validateConfig(cfgJson)) {
            throw "Invalid config file provided.";
        }

        this.connectToNode(cfgJson.address);
        this.loadAbis(cfgJson.abi);
        this.governor = EthFactory.Governor.at(cfgJson.governorAddress)
    }

    // Local wallet control
    async listWallet() {
        return this.ethDriver.getWallet();
    }

    addAccountToWallet(address, name) {
        this.ethDriver.addAccount(address, name);
    }

    // Project control
    async listProjects() {
        projList = [];
        const projectList = await this.governor.getProjects();

        await Promise.all(projectList.map(async (projectAddress) => {
            let projectObject = EthFactory.Project.at(projectAddress);

            projList.push({
                obj: projectObject,
                name: await projectObject.getName(),
                email: await projectObject.getEmail(),
                desc: await projectObject.getDescription(),
                img: await projectObject.getImg()
            });
          }));
        return projList;
    }

    async createProject(name, email, desc, img) {
        const projectAddress = await this.governor.createProject(name, email, desc, img);
        return projectAddress;
    }

    // Remote account control
    async createRemoteAccount() {
        this.governor.createAccount();
    }

    async getRemoteAccount(address = null) {
        return this.governor.getAccount(address);
    }
}

exports.KickInvest = KickInvest;