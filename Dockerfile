FROM java:8

ENV ANDROID_HOME /usr/local/android-sdk-linux
ENV PATH ${ANDROID_HOME}/tools:$ANDROID_HOME/platform-tools:$PATH
ENV PROJECT_DIR /opt

# Install Android SDK
RUN mkdir -p /usr/local/android-sdk-linux \
    && apt-get update \
    && wget https://dl.google.com/android/repository/sdk-tools-linux-3859397.zip -O tools.zip \
    && unzip tools.zip -d /usr/local/android-sdk-linux \
    && rm tools.zip

# Use 
RUN yes | $ANDROID_HOME/tools/bin/sdkmanager --licenses \
    && touch /root/.android/repositories.cfg \
    && $ANDROID_HOME/tools/bin/sdkmanager "build-tools;25.0.2" \
    && $ANDROID_HOME/tools/bin/sdkmanager "platforms;android-25" \
    && $ANDROID_HOME/tools/bin/sdkmanager "tools" "platform-tools" \
    && $ANDROID_HOME/tools/bin/sdkmanager "extras;android;m2repository" "extras;google;m2repository"

#react stuff
RUN curl -sL https://deb.nodesource.com/setup_6.x | bash \
    && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
    && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
    && apt-get update && apt-get install -y yarn

COPY . /opt/app

RUN yarn global add react-native-cli rnpm babel-cli \
    && chmod +x /opt/app/android/gradlew

WORKDIR /opt/app/android
CMD ["/bin/bash"]
