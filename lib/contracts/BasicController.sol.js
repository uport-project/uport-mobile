// Copyright (C) 2018 ConsenSys AG
//
// This file is part of uPort Mobile App.
//
// uPort Mobile App is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// uPort Mobile App is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with uPort Mobile App.  If not, see <http://www.gnu.org/licenses/>.
//
// Factory 'morphs' into a Pudding class.
// The reasoning is that calling load in each context
// is cumbersome.
(function () {
  const contractData = {
    abi: [{ constant: true,
            inputs: [],
            name: 'userKey',
            outputs: [{ name: '', type: 'address' }],
            type: 'function' },
          { constant: false,
            inputs: [{ name: 'newUserKey',
                       type: 'address' }],
            name: 'updateUserKey',
            outputs: [],
            type: 'function' },
          { constant: true,
            inputs: [],
            name: 'adminKey',
            outputs: [{ name: '',
                        type: 'address' }],
            type: 'function' },
          { constant: false,
            inputs: [{ name: 'destination',
                       type: 'address' },
                     { name: 'value',
                       type: 'uint256' },
                     { name: 'data',
                       type: 'bytes' }],
            name: 'forward',
            outputs: [],
            type: 'function' },
          { constant: true,
            inputs: [],
            name: 'proxy',
            outputs: [{ name: '', type: 'address' }],
            type: 'function' },
          { constant: false,
            inputs: [{ name: 'newAdminKey', type: 'address' }],
            name: 'updateAdminKey',
            outputs: [],
            type: 'function' },
          { constant: false,
            inputs: [{ name: 'newOwner', type: 'address' }],
            name: 'transferOwnership',
            outputs: [],
            type: 'function' },
          { inputs: [{ name: 'proxyAddress', type: 'address' },
                     { name: '_userKey', type: 'address' },
                     { name: '_adminKey', type: 'address' }],
            type: 'constructor' },
        ],
    binary: '606060405260405160608061033983395060c06040525160805160a05160008054600160a060020a031990811685179091556001805482168417905560028054909116821790555050506102e2806100576000396000f3606060405236156100615760e060020a60003504631c1c228981146100635780632281dad614610075578063233044d0146100b7578063d7f31eb9146100c9578063ec556889146101f8578063ec57ef821461020a578063f2fde38b1461024b575b005b6102cf600154600160a060020a031681565b610061600435600254600160a060020a039081169033168114156100b3576001805473ffffffffffffffffffffffffffffffffffffffff1916831790555b5050565b6102cf600254600160a060020a031681565b60806020604435600481810135601f8101849004909302840160405260608381526100619482359460248035956064949391019190819083828082843750949650505050505050600154600160a060020a039081169033168114156101f257600060009054906101000a9004600160a060020a0316600160a060020a031663d7f31eb98585856040518460e060020a0281526004018084600160a060020a03168152602001838152602001806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600f02600301f150905090810190601f1680156101d05780820380516001836020036101000a031916815260200191505b509450505050506000604051808303816000876161da5a03f115610002575050505b50505050565b6102cf600054600160a060020a031681565b610061600435600254600160a060020a039081169033168114156100b3576002805473ffffffffffffffffffffffffffffffffffffffff1916831790555050565b610061600435600254600160a060020a039081169033168114156100b357600080547f1a695230000000000000000000000000000000000000000000000000000000006060908152600160a060020a038086166064529190911691631a695230916084919060248183876161da5a03f1156100025750505081600160a060020a0316ff5b600160a060020a03166060908152602090f3',
    unlinked_binary: '606060405260405160608061033983395060c06040525160805160a05160008054600160a060020a031990811685179091556001805482168417905560028054909116821790555050506102e2806100576000396000f3606060405236156100615760e060020a60003504631c1c228981146100635780632281dad614610075578063233044d0146100b7578063d7f31eb9146100c9578063ec556889146101f8578063ec57ef821461020a578063f2fde38b1461024b575b005b6102cf600154600160a060020a031681565b610061600435600254600160a060020a039081169033168114156100b3576001805473ffffffffffffffffffffffffffffffffffffffff1916831790555b5050565b6102cf600254600160a060020a031681565b60806020604435600481810135601f8101849004909302840160405260608381526100619482359460248035956064949391019190819083828082843750949650505050505050600154600160a060020a039081169033168114156101f257600060009054906101000a9004600160a060020a0316600160a060020a031663d7f31eb98585856040518460e060020a0281526004018084600160a060020a03168152602001838152602001806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600f02600301f150905090810190601f1680156101d05780820380516001836020036101000a031916815260200191505b509450505050506000604051808303816000876161da5a03f115610002575050505b50505050565b6102cf600054600160a060020a031681565b610061600435600254600160a060020a039081169033168114156100b3576002805473ffffffffffffffffffffffffffffffffffffffff1916831790555050565b610061600435600254600160a060020a039081169033168114156100b357600080547f1a695230000000000000000000000000000000000000000000000000000000006060908152600160a060020a038086166064529190911691631a695230916084919060248183876161da5a03f1156100025750505081600160a060020a0316ff5b600160a060020a03166060908152602090f3',
    address: '0x6481c774eb7dcfc53c4d25fa765947dec61930df',
    generated_with: '2.0.9',
    contract_name: 'BasicController',
  };

  function Contract() {
    if (Contract.Pudding === null) {
      throw new Error(
        `BasicController error:
         Please call load() first before creating new instance of this contract.`
      );
    }
    Contract.Pudding.apply(this, arguments);
  }

  Contract.load = (Pudding) => {
    Contract.Pudding = Pudding;

    Pudding.whisk(contractData, Contract);

    // Return itself for backwards compatibility.
    return Contract;
  };

  Contract.new = () => {
    if (Contract.Pudding === null) {
      throw new Error('BasicController error: Please call load() first before calling new().');
    }

    return Contract.Pudding.new.apply(Contract, arguments);
  };

  Contract.at = () => {
    if (Contract.Pudding === null) {
      throw new Error('BasicController error: Please call load() first before calling at().');
    }

    return Contract.Pudding.at.apply(Contract, arguments);
  };

  Contract.deployed = () => {
    if (Contract.Pudding === null) {
      throw new Error('BasicController error: Please call load() first before calling deployed().');
    }

    return Contract.Pudding.deployed.apply(Contract, arguments);
  };

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Contract;
  } else {
    // There will only be one version of Pudding in the browser,
    // and we can use that.
    window.BasicController = Contract;
  }
})();
