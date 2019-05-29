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
import {
  SHOW_RECOVERY_SEED,
  SAVE_RECOVERY_SEED,
  HIDE_RECOVERY_SEED,
  SELECT_RECOVERY_SEED_WORD,
  START_SEED_RECOVERY,
  RECOVERY_SUCCESS
} from 'uPortMobile/lib/constants/RecoveryActionTypes'
// import { SOCIAL_RECOVERY_POP_ROUTE, SOCIAL_RECOVERY_PUSH_ROUTE, SOCIAL_RECOVERY_RESET_ROUTE } from '../constants/SocialRecoveryActionTypes'

export function showRecoverySeed () {
  return {
    type: SHOW_RECOVERY_SEED
  }
}

export function saveRecoverySeed (seed) {
  return {
    type: SAVE_RECOVERY_SEED,
    seed
  }
}

export function hideRecoverySeed () {
  return {
    type: HIDE_RECOVERY_SEED
  }
}

export function selectRecoveryWord (index) {
  return {
    type: SELECT_RECOVERY_SEED_WORD,
    index
  }
}

export function startSeedRecovery (phrase, componentId) {
  return {
    type: START_SEED_RECOVERY,
    phrase,
    componentId
  }
}

export function recoverySuccess () {
  return {
    type: RECOVERY_SUCCESS
  }
}
