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
import { delay, channel } from 'redux-saga'
import { call, select, put, spawn } from 'redux-saga/effects'
import {
  eventBlock
} from 'uPortMobile/lib/selectors/eventLogs'
import {storeLastBlockForLogs, storeEvents} from 'uPortMobile/lib/actions/eventLogActions.js'
import {
  logDecoder
} from 'ethjs-abi/dist/ethjs-abi.min.js'

const MAX_BLOCKS_PER_REQUEST = 500

function* pollForEvents (ch, web3, contract, abi, rate = 30000) {
  console.log(`pollForEvents ${abi.contract_name} - ${contract}`)
  // console.log(abi)
  const decoder = logDecoder(abi)
  let fromBlock = yield select(eventBlock, contract)
  let toBlock
  let running = true

  console.log(`Creating eventChannel <<===================`)
  while (running) {
    try {
      let latestBlock = yield call(web3.blockNumber)
      fromBlock = yield select(eventBlock, contract)
      // fromBlock = fromBlock.add(1)
      if (!fromBlock) {
        fromBlock = latestBlock
      }
      if ((latestBlock - fromBlock) > MAX_BLOCKS_PER_REQUEST) {
        toBlock = fromBlock + MAX_BLOCKS_PER_REQUEST
      } else {
        toBlock = latestBlock
      }
      // console.log(`checking logs on ${contract} ${fromBlock.toString()} to ${toBlock.toString()} - ${latestBlock.toString()}`)
      const payload = {
        fromBlock: `0x${fromBlock.toString(16)}`,
        toBlock: `0x${toBlock.toString(16)}`,
        address: contract
      }
      // console.log(payload)
      const logs = yield call(web3.getLogs, payload)
      // console.log(logs)
      yield put(storeLastBlockForLogs(contract, toBlock))
      if (logs.length > 0) {
        const events = decoder(logs)
        // console.log(events)
        for (let event of events) {
          // console.log(event)
          yield put(ch, event)
        }
        yield put(storeEvents(contract, events))
      }
      if (toBlock === latestBlock) {
        yield call(delay, rate)
      }
    } catch (error) {
      console.log('error in pollForEvents')
      console.log(error)
      yield call(delay, rate)
    }
  }
}

export function* eventLogChannel (web3, contract, abi, rate = 30000) {
  // console.log(`Creating channel <<===================`)
  const ch = yield call(channel)
  yield spawn(pollForEvents, ch, web3, contract, abi, rate)
  return ch
}
