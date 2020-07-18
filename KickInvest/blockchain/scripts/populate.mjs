// const Web3 = require('web3');
import Web3 from 'web3'
import fs from 'fs';
import KickInvest from '../../app/src/scripts/KickInvest.mjs';

const cfg = JSON.parse(fs.readFileSync('../kickinvest-cfg.json'));

/*
const privateKeys = {
    account1: "0xf8e9adc5b55989814c3f02272c12fb5b344cac9b0cb8c6530294e3f9b7bacc56", // 0xfB2B0a64558a65858A6ACFE237bF40Bee679a1c4
    account2: "0xb63b8fb8a7dfb4634d5bd870229447f80f1102cec1d7e64bf5e1754f157e1355", // 0xe94B1974BAe282c4aF4Cf790A7A90bb608CB22d3
    account3: "0x51bff61a9101fb061612e82bd97e08d9b844647d7a0749367dadcd35c24dc846", // 0x94aBC7651436597Fd611F8F4E3852d3dA6CcA7f9
    account3: "0xe7c9f8872cdb8c702e8396ec1a04574d11e1ece96e96b5eeaead98b665f799f6"  // 0x5035fd69dB0Ae69C62DacBA547e0e902f4A315BA
};
*/

const privateKeys = {
    account1: "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d", // 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1
    account2: "0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1", // 0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0
    account3: "0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c", // 0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b
    account3: "0x646f1ce2fdad0e6deeeb5c7e8e5543bdde65e86029e2fd9fc169899c440a7913"  // 0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d
}

const projectInfo = [
    ["Project #1", "test@email.com", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque egestas ipsum ullamcorper scelerisque laoreet. Phasellus molestie dolor eget odio finibus, et cursus ex aliquam.", "https://images.unsplash.com/photo-1433838552652-f9a46b332c40?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80"],
    ["Project #2", "test@email.com", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque egestas ipsum ullamcorper scelerisque laoreet. Phasellus molestie dolor eget odio finibus, et cursus ex aliquam.", "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1949&q=80"],
    ["Project #3", "test@email.com", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque egestas ipsum ullamcorper scelerisque laoreet. Phasellus molestie dolor eget odio finibus, et cursus ex aliquam.", "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80"]
];

let projectContracts = []

KickInvest.getInstance().login(privateKeys.account1, 'Vasile');


// web3.eth.personal.


