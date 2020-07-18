const fs = require('fs');


class ContractBase {
    constructor(ethd, contract) {
        this.ethd = ethd;
        this.contract = contract;
        this.eventListener = {}
    }

    waitForEvent(eventName, cb) {
        let eventListener = this.contract.events[eventName]((err, subscription)  => {
            if(!err) {
                cb(err, subscription);
                eventListener.unsubscribe();
            }
        });
    }

    subscribeToEvent(eventName, cb) {
        this.unsubscribeToEvent(eventName);
        this.eventListener[eventName] = this.contract.events[eventName]((err, subscription) => {
            if(!err) {
                cb(err, subscription);
            }
        });
    }

    unsubscribeToEvent(eventName) {
        if(typeof this.eventListener[eventName] !== 'undefined') {
            this.eventListener[eventName].unsubscribe();
        }
    }

    getAddress() {
        return this.contract._address;
    }
}

class Governor extends ContractBase{
    async getOwner() {
        return this.contract.methods.owner().call();
    }

    getAccount(address = null) {
        if(!address) {
            address = this.ethd.getCurrentAccount();
        }
        return this.contract.methods.getAccount(address).call();
    }

    async getProjects() {
        return this.contract.methods.getProjects().call();
    }

    async createProject(...args) {
        // TODO: Caching later
        return new Promise((resolve, reject) => {
            this.waitForEvent('NewProject', (err, subscription) => {
                if(err) {
                    reject(err);
                }
                if(subscription.returnValues.creator === this.ethd.getCurrentAccount().address) {
                    resolve(subscription.returnValues.projectAddress);
                }
            });

            try {
                this.ethd.signAndCallMethod(this.getAddress(), this.contract.methods.createProject(...args));
            }
            catch(exc) {
                reject(exc);
            }
        });
    }

    async createAccount(name) {
        return new Promise(async (resolve, reject) => {
            this.waitForEvent('NewAccount', (err, subscription) => {
                if(err) {
                    reject(err);
                }
                if(subscription.returnValues.creator === this.ethd.getCurrentAccount().address) {
                    resolve(subscription.returnValues.accountAddress);
                }
            });

            try {
                await this.ethd.signAndCallMethod(this.getAddress(), this.contract.methods.createAccount(name));
            }
            catch(exc) {
                reject(exc);
            }
        });
    }
}

class Account extends ContractBase {
    getName() {
        return this.contract.methods.getName().call();
    }
    
    async invest(project, value) {
        return new Promise(async (resolve, reject) => {
            project.waitForEvent('NewInvestor', (err, subscription) => {
                if(err) {
                    reject(err);
                }
                if(subscription.returnValues.investor === this.getAddress()) {
                    resolve(subscription.returnValues.investor);
                }
            });

            try {
                await this.ethd.signAndCallMethod(this.getAddress(), this.contract.methods.invest(project.getAddress()), value, 1500000);
            }
            catch(exc) {
                reject(exc);
            }
        });
    }

    async createProject(...args) {
        return new Promise(async (resolve, reject) => {
            this.waitForEvent('NewProject', (err, subscription) => {
                if(err) {
                    reject(err);
                }
                if(subscription.returnValues.creator === this.contract._address) {
                    resolve(subscription.returnValues.projectAddress);
                }
            });
            try {
                await this.ethd.signAndCallMethod(this.getAddress(), this.contract.methods.createProject(...args));
            }
            catch(exc) {
                reject(exc);
            }
        });
    }

    async initTransfer(project, recipient, reason, value) {
        return new Promise(async (resolve, reject) => {
            project.waitForEvent('NewTransfer', (err, subscription) => {
                if(err) {
                    reject(err);
                }
                resolve(subscription.returnValues.transferAddress);
            });

            try {
                await this.ethd.signAndCallMethod(this.getAddress(), this.contract.methods.initTransfer(project.getAddress(), recipient, reason, value));
            }
            catch(exc) {
                reject(exc);
            }
        });
    }

    async castAye(transfer) {
        return new Promise(async (resolve, reject) => {
            transfer.waitForEvent('NewVote', (err, subscription) => {
                if(err) {
                    reject(err);
                }
                resolve(subscription.returnValues.caster);
            });
            try {
                await this.ethd.signAndCallMethod(this.getAddress(), this.contract.methods.voteAye(transfer.getAddress()));
            }
            catch(exc) {
                reject(exc);
            }
        });
    }

    async castNay(transfer) {
        return new Promise(async (resolve, reject) => {
            transfer.waitForEvent('NewVote', (err, subscription) => {
                if(err) {
                    reject(err);
                }
                resolve(subscription.returnValues.caster);
            });
            try {
                await this.ethd.signAndCallMethod(this.getAddress(), this.contract.methods.voteNay(transfer.getAddress()));
            }
            catch(exc) {
                reject(exc);
            }
        });
    }

    async removeVote(transfer) {
        return new Promise(async (resolve, reject) => {
            transfer.waitForEvent('NewVote', (err, subscription) => {
                if(err) {
                    reject(err);
                }
                resolve(subscription.returnValues.caster);
            });
            try {
                await this.ethd.signAndCallMethod(this.getAddress(), this.contract.methods.removeVote(transfer.getAddress()));
            }
            catch(exc) {
                reject(exc);
            }
        });
    }

    async checkVotes(transfer) {
        return new Promise(async (resolve, reject) => {
            transfer.waitForEvent('TransferStatus', (err, subscription) => {
                if(err) {
                    reject(err);
                }
                resolve(subscription.returnValues.result);
            });
            try {
                await this.ethd.signAndCallMethod(this.getAddress(), this.contract.methods.checkVotes(transfer.getAddress()));
            }
            catch(exc) {
                reject(exc);
            }
        });
    }

    async removeTransfer(transfer) {
        return new Promise(async (resolve, reject) => {
            transfer.waitForEvent('TransferStatus', (err, subscription) => {
                if(err) {
                    reject(err);
                }
                resolve(subscription.returnValues.result);
            });
            try {
                await this.ethd.signAndCallMethod(this.getAddress(), this.contract.methods.removeTransfer(transfer.getAddress()));
            }
            catch(exc) {
                reject(exc);
            }
        });
    }

    getInvestedProjects() {
        return this.contract.methods.getInvestedProjects().call();
    }

    getPersonalProjects() {
        return this.contract.methods.getPersonalProjects().call();
    }

    getInvestedSum(address) {
        return this.contract.methods.getInvestedSum(address).call();
    }
}

class Project extends ContractBase {
    getOwner() {
        return this.contract.methods.owner().call();
    }

    getName() {
        return this.contract.methods.name().call();
    }

    getEmail() {
        return this.contract.methods.email().call();
    }

    getDescription() {
        return this.contract.methods.description().call();
    }

    getImg() {
        return this.contract.methods.img().call();
    }

    getNumberOfInvestors() {
        return this.contract.methods.getNumberOfInvestors().call();
    }

    getProjectAccount() {
        return this.contract.methods.account().call();
    }

    getTransfers() {
        return this.contract.methods.getTransfers().call();
    }

    investAnnonymous(value) {
        return new Promise((resolve, reject) => {
            this.waitForEvent('NewInvestor', (err, subscription) => {
                if(err) {
                    reject(err);
                }
                if(subscription.returnValues.creator === this.ethd.getCurrentAccount().address) {
                    resolve(subscription.returnValues.projectAddress);
                }
            });

            try {
                this.ethd.signAndCallMethod(this.getAddress(), this.contract.methods.investAnnonymous(), value);
            }
            catch(exc) {
                reject(exc);
            }
        });
    }

    initTransfer(recipient, reason, value) {
        return new Promise((resolve, reject) => {
            this.getOwner().then((ownerAddress) => {
                if(this.ethd.getCurrentAccount() !== ownerAddress) {
                    reject("Only owner can call this function.");
                }

                this.waitForEvent('NewTransfer', (err, subscription) => {
                    if(err) {
                        reject(err);
                    }
                    if(subscription.returnValues.investor === this.ethd.getCurrentAccount().address) {
                        resolve(subscription.returnValues.transferAddress);
                    }
                });

                try {
                    this.ethd.signAndCallMethod(this.getAddress(), this.contract.methods.initTransfer(recipient, reason, value));
                }
                catch(exc) {
                    reject(exc);
                }
            });
        });
    }
}

class Transfer extends ContractBase {
    getOwner() {
        return this.contract.methods.owner().call();
    }

    getProject() {
        return this.contract.methods.project().call();
    }

    getRecipient() {
        return this.contract.methods.recipient().call();
    }

    getValue() {
        return this.contract.methods.value().call();
    }

    getReason() {
        return this.contract.methods.reason().call();
    }

    getVotes(address = null) {
        if(!address) {
            address = this.ethd.getCurrentAccount();
        }
        return this.contract.methods.votes(address).call();
    }

    getAyeVotes() {
        return this.contract.methods.getAyeVotes().call();
    }

    getNayVotes() {
        return this.contract.methods.getNayVotes().call();
    }

    getNumberOfVotes() {
        return this.contract.methods.getNumberOfVotes().call();
    }

    getTransferResult() {
        return this.contract.methods.getTransferResult().call();
    }

    getVote(address) {
        return this.contract.methods.getVote(address).call();
    }

    aye() {
        return new Promise((resolve, reject) => {
            this.waitForEvent('NewVote', (err, subscription) => {
                if(err) {
                    reject(err);
                }
                if(subscription.returnValues.caster === this.ethd.getCurrentAccount().address) {
                    resolve(true);
                }
            });

            try {
                this.ethd.signAndCallMethod(this.getAddress(), this.contract.methods.aye());
            }
            catch(exc) {
                reject(exc);
            }
        });
    }

    nay() {
        return new Promise((resolve, reject) => {
            this.waitForEvent('NewVote', (err, subscription) => {
                if(err) {
                    reject(err);
                }
                if(subscription.returnValues.caster === this.ethd.getCurrentAccount().address) {
                    resolve(true);
                }
            });

            try {
                this.ethd.signAndCallMethod(this.getAddress(), this.contract.methods.nay());
            }
            catch(exc) {
                reject(exc);
            }
        });
    }
}

export let EthFactory = {
    ethd: null,
    abi: {
        Governor: null,
        Account: null,
        Project: null,
        Transfer: null
    },

    setDriver: function(ethd) {
        this.ethd = ethd;
    },

    setAbi: function(contract, abi) {
        if(this.abi.hasOwnProperty(contract)) {
            this.abi[contract] = abi;
        }
    },

    getContract: function(type, address) {
        return new EthFactory.ethd.w3.eth.Contract(type, address);
    },

    Governor: {
        at: function(address) {
            const projectContract = EthFactory.getContract(EthFactory.abi.Governor, address);
            return new Governor(EthFactory.ethd, projectContract);
        }
    },

    Account: {
        at: function(address){
            const accountContract = EthFactory.getContract(EthFactory.abi.Account, address);
            return new Account(EthFactory.ethd, accountContract);
        }  
    },

    Project: {
        at: function(address) {
            const projectContract = EthFactory.getContract(EthFactory.abi.Project, address);
            return new Project(EthFactory.ethd, projectContract);
        }
    },

    Transfer: {
        at: function(address) {
            const transferContract = EthFactory.getContract(EthFactory.abi.Transfer, address);
            return new Transfer(EthFactory.ethd, transferContract);
        }
    }
};

// export default EthFactory;