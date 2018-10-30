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
// Factory "morphs" into a Pudding class.
// The reasoning is that calling load in each context
// is cumbersome.

(function() {

  var contract_data = {
    abi: [{"constant":false,"inputs":[{"name":"_owner","type":"address"}],"name":"transfer","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"isOwner","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"destination","type":"address"},{"name":"value","type":"uint256"},{"name":"data","type":"bytes"}],"name":"forward","outputs":[],"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"destination","type":"address"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"data","type":"bytes"}],"name":"Forwarded","type":"event"}],
    binary: "606060405260008054600160a060020a0319163317905561024f806100246000396000f3606060405260e060020a60003504631a695230811461003c5780632f54bf6e1461004b5780638da5cb5b14610066578063d7f31eb914610078575b005b61003a6004356100fe33610052565b6100cd6004355b600054600160a060020a0391821691161490565b6100e1600054600160a060020a031681565b604080516020600460443581810135601f810184900484028501840190955284845261003a94823594602480359560649492939190920191819084018382808284375094965050505050505061012633610052565b604080519115158252519081900360200190f35b60408051600160a060020a03929092168252519081900360200190f35b15610123576000805473ffffffffffffffffffffffffffffffffffffffff1916821790555b50565b1561024a5782600160a060020a03168282604051808280519060200190808383829060006004602084601f0104600302600f01f150905090810190601f1680156101845780820380516001836020036101000a031916815260200191505b5091505060006040518083038185876185025a03f19250505015156101a857610002565b82600160a060020a03167fc1de93dfa06362c6a616cde73ec17d116c0d588dd1df70f27f91b500de207c41838360405180838152602001806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f16801561023b5780820380516001836020036101000a031916815260200191505b50935050505060405180910390a25b50505056",
    unlinked_binary: "606060405260008054600160a060020a0319163317905561024f806100246000396000f3606060405260e060020a60003504631a695230811461003c5780632f54bf6e1461004b5780638da5cb5b14610066578063d7f31eb914610078575b005b61003a6004356100fe33610052565b6100cd6004355b600054600160a060020a0391821691161490565b6100e1600054600160a060020a031681565b604080516020600460443581810135601f810184900484028501840190955284845261003a94823594602480359560649492939190920191819084018382808284375094965050505050505061012633610052565b604080519115158252519081900360200190f35b60408051600160a060020a03929092168252519081900360200190f35b15610123576000805473ffffffffffffffffffffffffffffffffffffffff1916821790555b50565b1561024a5782600160a060020a03168282604051808280519060200190808383829060006004602084601f0104600302600f01f150905090810190601f1680156101845780820380516001836020036101000a031916815260200191505b5091505060006040518083038185876185025a03f19250505015156101a857610002565b82600160a060020a03167fc1de93dfa06362c6a616cde73ec17d116c0d588dd1df70f27f91b500de207c41838360405180838152602001806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f16801561023b5780820380516001836020036101000a031916815260200191505b50935050505060405180910390a25b50505056",
    address: "0x0564d1d6e3b1f77aa29eb6ab10745ea611f38ff7",
    generated_with: "2.0.9",
    contract_name: "Proxy"
  };

  function Contract() {
    if (Contract.Pudding == null) {
      throw new Error("Proxy error: Please call load() first before creating new instance of this contract.");
    }

    Contract.Pudding.apply(this, arguments);
  };

  Contract.load = function(Pudding) {
    Contract.Pudding = Pudding;

    Pudding.whisk(contract_data, Contract);

    // Return itself for backwards compatibility.
    return Contract;
  }

  Contract.new = function() {
    if (Contract.Pudding == null) {
      throw new Error("Proxy error: Please call load() first before calling new().");
    }

    return Contract.Pudding.new.apply(Contract, arguments);
  };

  Contract.at = function() {
    if (Contract.Pudding == null) {
      throw new Error("Proxy error: Please call load() first before calling at().");
    }

    return Contract.Pudding.at.apply(Contract, arguments);
  };

  Contract.deployed = function() {
    if (Contract.Pudding == null) {
      throw new Error("Proxy error: Please call load() first before calling deployed().");
    }

    return Contract.Pudding.deployed.apply(Contract, arguments);
  };

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of Pudding in the browser,
    // and we can use that.
    window.Proxy = Contract;
  }

})();
