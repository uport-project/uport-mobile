#!/bin/bash


echo "Cleaning Android project..."
cd android
./gradlew clean
cd ..
echo "Done Cleaning"
