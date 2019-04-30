#!/bin/bash
set -e

GIT_MERGE_AUTOEDIT=no

### This script is meant to go through git flow and create a new release with bumped versions
### It will fail if the current working dir is not clean when starting the process
### Since version codes can manually fall out of sync between the 2 platforms,
### iOS takes precedence and is used as the base to increment from

### This script has some prerequisites
###
# * git-flow-avh
#     `brew install git-flow-avh`
# * ruby > 2.1.0
# * github_changelog_generator
#     `sudo gem install github_changelog_generator`
# * generate a Github token with **repo** scope
#     https://github.com/settings/tokens/new?description=GitHub%20Changelog%20Generator%20token
# * add the github token to ENV
#     `export CHANGELOG_GITHUB_TOKEN=«your-40-digit-github-token»`
# * make it permanent by writing the line above to `~/.bash_profile` or whatever your system needs
# * reload your .bash_profile for your system with the terminal command `source ~/.bash_profile`
###
###

SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$SCRIPTS_DIR/.."
ANDROID_DIR="$ROOT_DIR/android"
IOS_DIR="$ROOT_DIR/ios"

echo "check clean repo"
cd ${ANDROID_DIR} ; ./gradlew -q checkCleanRepo ; cd -

echo "get current version"
cd ${IOS_DIR} ; current_version=$(xcrun agvtool what-version -terse) ; cd -

echo "increment"
new_version="$(($current_version + 1))"

echo "git flow release start v$new_version"
git fetch --all
git flow release start v${new_version}

bash ${SCRIPTS_DIR}/bump_version.sh ${new_version}

echo "git flow release finish v$new_version"
git flow release finish -m "release-v$new_version" v${new_version}

echo "The release has been finished locally only"
echo "To push it, run \`git push origin master develop --tags\`"