#!/usr/bin/env python3

import json
import os
import argparse
from urllib import parse


DEFAULT_CONTRACT_BUILD_PATH = '../contracts/build/contracts/'
DEFAULT_NODE_HOST = 'ws://127.0.0.1:8545/'
DEFAULT_CFG_FILE = '../kickinvest-cfg.json'


class colorz:
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'


def padded_log(msg, color=colorz.END, end=None):
    print(f'{color}{msg:.<40}{colorz.END}', end=end)


def get_abi_from_json(path):
    with open(path, 'r') as f:
        contract_json = json.loads(f.read())
        if 'abi' not in contract_json:
            raise 'Property `abi` not found in json! Skipping...'

        if 'contractName' not in contract_json:
            raise 'Property `contractName` not found in json! Skipping...'

        return (contract_json['contractName'], contract_json['abi'])


def read_json_abi_dir(path):
    if not os.path.isdir(path):
        raise f'Directory {path} not found. Skipping...'

    abi_dict = {}
    for file in os.scandir(path):
        if file.is_file():
            padded_log(f'[*] Reading {file.name}...', colorz.BLUE, '')
            try:
                name, abi = get_abi_from_json(file.path)
                abi_dict[name] = abi
                print(f'{colorz.GREEN} Done!{colorz.END}')
            except Exception as exc:
                print(colorz.RED + '[!] ' + exc + colorz.END)

    return abi_dict


def gen_config(address, governor_address, json_path):
    config = {}
    config['address'] = address
    config['governorAddress'] = governor_address
    try:
        config['abi'] = read_json_abi_dir(json_path)
    except Exception as exc:
        print(colorz.RED + '[!] ' + exc + colorz.END)

    return config


def main():
    argparser = argparse.ArgumentParser(
        description='Simple script for generating a config file for kickinvest')
    argparser.add_argument('-f',
                           dest='contracts_folder',
                           metavar='DIR',
                           action='store',
                           default=DEFAULT_CONTRACT_BUILD_PATH,
                           help='Path to built contracts using truffle')
    argparser.add_argument('-d',
                           dest='deploy_log',
                           metavar='FILE',
                           action='store',
                           default=None,
                           help='Path to deploy log from truffle migration')
    argparser.add_argument('-n',
                           dest='eth_host',
                           metavar='HOST',
                           action='store',
                           default=DEFAULT_NODE_HOST,
                           help='ETH node host address')
    argparser.add_argument('-o',
                           dest='out_file',
                           metavar='FILE',
                           action='store',
                           default=DEFAULT_CFG_FILE,
                           help='Write config file to a specific location')

    args = argparser.parse_args()

    parsed_host = parse.urlparse(args.eth_host)
    if not parsed_host.scheme or not parsed_host.port:
        print(
            f'{colorz.RED}[!] No schema or port provided for node host address. {colorz.END}')
        return

    governor_address = None
    if not args.deploy_log:
        print('Governor contract address: (default: 0xCfEB869F69431e42cdB54A4F4f105C19C080A601)')
        governor_address = input(colorz.YELLOW + '? ' + colorz.END)
        if governor_address == '':
            governor_address = '0xCfEB869F69431e42cdB54A4F4f105C19C080A601'
    else:
        pass

    cfg = gen_config(args.eth_host, governor_address, args.contracts_folder)

    print(f'\n[*] Writing log file to {args.out_file}...', end='')
    with open(args.out_file, 'w') as f:
        f.write(json.dumps(cfg, indent=4))
        print(f'{colorz.GREEN} Done!{colorz.END}')


if __name__ == '__main__':
    main()
