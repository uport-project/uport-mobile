#!/bin/bash
set -e

SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$SCRIPTS_DIR/.."
IOS_DIR="$ROOT_DIR/ios"

if [[ $# -eq 1 ]]
then
    new_version=$1
    echo "set ios marketing version to $new_version"
    cd ${IOS_DIR} ; agvtool new-marketing-version ${new_version} ; cd -
fi

