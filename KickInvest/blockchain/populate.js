const { EthFactory } = require("./Contracts.js");
const { EthDriver } = require("./EthDriver.js");
const fs = require("fs");

const cfg = JSON.parse(fs.readFileSync("kickinvest-cfg.json").address);

const govAddress = cfg.governorAddress;
const e = new EthDriver(cfg.address);

EthFactory.setDriver(e);

const abiLists = ["Governor", "Account", "Project", "Transfer"];

abiLists.forEach((e) => {
  EthFactory.setAbi(e, cfg.abi[e]);
});

// My private key account
e.addAccount(
  "0xf8e9adc5b55989814c3f02272c12fb5b344cac9b0cb8c6530294e3f9b7bacc56",
  "Veronica"
);

e.w3.eth.sendTransaction({
  to: "0xfB2B0a64558a65858A6ACFE237bF40Bee679a1c4", // my private account address (^ can be computed using `privateKeyToAccount()`)
  from: "0x1dF62f291b2E969fB0849d99D9Ce41e2F137006e", // some address having much money
  value: 10000000000000000000, // 10 ETH
});

const g = EthFactory.Governor.at(govAddress);

async function getAccount() {
  const account = await g.getAccount(e.getCurrentAccount());
  console.log("Account found: " + account);
}

async function createAccount() {
  const accountAddress = await g.createAccount();
  console.log("Account created: " + accountAddress);
  return accountAddress;
}

async function createProject(name, email, desc, img, numberOfInvestors) {
  const projectAddress = await g.createProject(
    name,
    email,
    desc,
    img,
    numberOfInvestors
  );
  console.log("Project created: " + projectAddress);
  return projectAddress;
}

let project, account, transfer, p, a, t;

async function test() {
  project = await createProject("hei", "hei", "hei", "hei");
  account = await createAccount();

  console.log("Project address:" + project);
  console.log("Account address:" + account);

  p = EthFactory.Project.at(project);
  a = EthFactory.Account.at(account);

  transfer = await a.invest(p, 10000);

  t = EthFactory.Transfer.at(transfer);
}

createAccount();

