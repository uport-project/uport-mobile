#!/bin/bash
set -e

SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$SCRIPTS_DIR/.."
ANDROID_DIR="$ROOT_DIR/android"
IOS_DIR="$ROOT_DIR/ios"

echo "get current version"
cd ${IOS_DIR} ; current_version=$(xcrun agvtool what-version -terse) ; cd -

echo "increment"
new_version="$(($current_version + 1))"

if [[ $# -eq 1 ]]
then
    new_version=$1
fi

echo "set android version to $new_version"
cd ${ANDROID_DIR} ; ./gradlew -q bumpVersion -P_BUILD_NUMBER=${new_version} ; cd -

echo "set ios version to $new_version"
cd ${IOS_DIR} ; agvtool new-version -all ${new_version} ; cd -

echo "generate changelog"

cd ${ROOT_DIR}
github_changelog_generator -u uport-project -p uport-mobile --no-issues --max-issues=200 --future-release=v${new_version}
cd -

echo "commit"
cd ${ROOT_DIR}
git add */version.properties
git add */Info.plist
git add */project.pbxproj
git add CHANGELOG.md
git commit -m "bump build version to $new_version"
cd -