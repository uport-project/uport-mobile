#!/bin/bash
set -e

SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$SCRIPTS_DIR/.."

vault read -field=value secret/android/service_key | base64 --decode > ${ROOT_DIR}/google-play-key-file.json