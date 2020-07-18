const { EthFactory } = require('./Contracts.js');
const { EthDriver } = require('./EthDriver.js');
const fs = require('fs');

const cfg = JSON.parse(fs.readFileSync("kickinvest-cfg.json"));

const e = new EthDriver(cfg.address);

const abiList = [
    'Governor',
    'Account',
    'Project',
    'Transfer'
];

EthFactory.setDriver(e);

abiList.forEach((e) => {
    EthFactory.setAbi(e, cfg.abi[e]);
});

// My private key account
e.addAccount('0xf8e9adc5b55989814c3f02272c12fb5b344cac9b0cb8c6530294e3f9b7bacc56');

e.w3.eth.sendTransaction({
    to: '0xfB2B0a64558a65858A6ACFE237bF40Bee679a1c4',   // my private account address (^ can be computed using `privateKeyToAccount()`)
    from: '0xd03ea8624C8C5987235048901fB614fDcA89b117', // some address having much money
    value: 10000000000000000000                         // 10 ETH
});

const g = EthFactory.Governor.at(cfg.governorAddress);

async function getAccount() {
    const account = await g.getAccount(e.getCurrentAccount());
    console.log("Account found: " + account);
}

async function createAccount() {
    const accountAddress = await g.createAccount("Veronica");
    console.log("Account created: " + accountAddress);
    return accountAddress;
}

async function createProject(name, email, desc, img) {
    return new Promise((resolve, reject) => {
        // const projectAddress = await g.createProject(name, email, desc, img);
        g.createProject(name, email, desc, img).then((projectAddress) => {
            console.log("Project created: " + projectAddress);
            resolve(projectAddress);
        })
    });
}

let project, account, transfer, p, a, t;

async function test() {
    project = await createProject('hei', 'hei', 'hei', 'hei');
    account = await createAccount();

    console.log("Project address:" + project);
    console.log("Account address:" + account);

    p = EthFactory.Project.at(project);
    a = EthFactory.Account.at(account);

    transfer = await a.invest(p, 10000);

    t = EthFactory.Transfer.at(transfer);
}

const project_info = [
    ["Project #1", "test@email.com", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque egestas ipsum ullamcorper scelerisque laoreet. Phasellus molestie dolor eget odio finibus, et cursus ex aliquam.", "https://images.unsplash.com/photo-1433838552652-f9a46b332c40?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80"],
    ["Project #2", "test@email.com", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque egestas ipsum ullamcorper scelerisque laoreet. Phasellus molestie dolor eget odio finibus, et cursus ex aliquam.", "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1949&q=80"],
    ["Project #3", "test@email.com", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque egestas ipsum ullamcorper scelerisque laoreet. Phasellus molestie dolor eget odio finibus, et cursus ex aliquam.", "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80"]
];

let projects_contracts = [];
let kickinvest_account;

function test(a, b, c, d) {
    console.log(a + b + c + d);
}

async function deploy_projects() {
    for(let i = 0; i < project_info.length; ++i)
    {
        let addr = await createProject(...project_info[i]);
        projects_contracts.push(EthFactory.Project.at(addr));
    }
}

async function deploy_accounts() {
    kickinvest_account = EthFactory.Account.at(await createAccount());
}

async function invest_projects() {
    await kickinvest_account.invest(projects_contracts[0], 10000);
}

async function run_deploy() {
    await deploy_projects();
    // console.log(projects_contracts)
    await deploy_accounts();
    await invest_projects();
}

run_deploy();
