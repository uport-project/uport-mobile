#!/bin/bash
#
# fix-rncamera-search-paths.sh
#
# Fix Frameworks/Headers Search Path build settings in react-native-camera/ios Xcode project
# First argument is path to RNCamera xcode project file, e.g.: 
#   ./node_modules/react-native-camera/ios/RNCamera.xcodeproj/project.pbxproj
# https://github.com/react-native-community/react-native-camera/issues/1407

SRC_FILE="$1"

if [ ! -f ${SRC_FILE} ]; then
    echo "Error: RNCamera xcodeproj not found at path: ${SRC_FILE}"
    echo "Skipping fix"
    exit 0
fi

echo "Running RN camera search paths fix"
# echo "Fixing RNCamera xcodeproj at path: ${SRC_FILE}"
# echo "Check before fix:"

# cat "${SRC_FILE}" | grep -A 4 FRAMEWORK_SEARCH_PATHS
# cat "${SRC_FILE}" | grep -A 3 HEADER_SEARCH_PATHS

perl -i -p0e 's/FRAMEWORK_SEARCH_PATHS = (.*?);/FRAMEWORK_SEARCH_PATHS = "\$(SRCROOT)\/..\/..\/..\/ios\/Pods\/Headers\/**\/**";/gs' ${SRC_FILE}

perl -i -p0e 's/HEADER_SEARCH_PATHS = (.*?);/HEADER_SEARCH_PATHS = "\$(SRCROOT)\/..\/..\/react-native\/React\/**";/gs' ${SRC_FILE}

# echo "Check after fix:"
# cat "${SRC_FILE}" | grep FRAMEWORK_SEARCH_PATHS
# cat "${SRC_FILE}" | grep HEADER_SEARCH_PATHS

echo "Done"
