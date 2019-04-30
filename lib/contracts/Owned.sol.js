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
    abi: [{"constant":false,"inputs":[{"name":"_owner","type":"address"}],"name":"transfer","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"isOwner","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"type":"function"},{"inputs":[],"type":"constructor"}],
    binary: "606060405260008054600160a060020a0319163317905560bd8060226000396000f3606060405260e060020a60003504631a6952308114602e5780632f54bf6e14603a5780638da5cb5b146054575b005b602c6004356096336040565b60656004355b600054600160a060020a0391821691161490565b6079600054600160a060020a031681565b604080519115158252519081900360200190f35b60408051600160a060020a03929092168252519081900360200190f35b1560ba576000805473ffffffffffffffffffffffffffffffffffffffff1916821790555b5056",
    unlinked_binary: "606060405260008054600160a060020a0319163317905560bd8060226000396000f3606060405260e060020a60003504631a6952308114602e5780632f54bf6e14603a5780638da5cb5b146054575b005b602c6004356096336040565b60656004355b600054600160a060020a0391821691161490565b6079600054600160a060020a031681565b604080519115158252519081900360200190f35b60408051600160a060020a03929092168252519081900360200190f35b1560ba576000805473ffffffffffffffffffffffffffffffffffffffff1916821790555b5056",
    address: "0xeb13a1bb3e52ef45da0d148ef70a2a5d2444574a",
    generated_with: "2.0.9",
    contract_name: "Owned"
  };

  function Contract() {
    if (Contract.Pudding == null) {
      throw new Error("Owned error: Please call load() first before creating new instance of this contract.");
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
      throw new Error("Owned error: Please call load() first before calling new().");
    }

    return Contract.Pudding.new.apply(Contract, arguments);
  };

  Contract.at = function() {
    if (Contract.Pudding == null) {
      throw new Error("Owned error: Please call load() first before calling at().");
    }

    return Contract.Pudding.at.apply(Contract, arguments);
  };

  Contract.deployed = function() {
    if (Contract.Pudding == null) {
      throw new Error("Owned error: Please call load() first before calling deployed().");
    }

    return Contract.Pudding.deployed.apply(Contract, arguments);
  };

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of Pudding in the browser,
    // and we can use that.
    window.Owned = Contract;
  }

})();
