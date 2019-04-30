#!/bin/bash
set -e

SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$SCRIPTS_DIR/.."

vault read -field=value secret/android/google_services | base64 --decode > ${ROOT_DIR}/android/app/google-services.json