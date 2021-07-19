/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Platform,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {AppleButton} from '@invertase/react-native-apple-authentication';
import auth from '@react-native-firebase/auth';
import {appleAuth} from '@invertase/react-native-apple-authentication';

import {
  AccessToken,
  AuthenticationToken,
  LoginButton,
  LoginManager,
  Profile,
} from 'react-native-fbsdk-next';

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const onAppleButtonPress = async () => {
    // Start the sign-in request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    // Ensure Apple returned a user identityToken
    if (!appleAuthRequestResponse.identityToken) {
      throw 'Apple Sign-In failed - no identify token returned';
    }

    // Create a Firebase credential from the response
    const {identityToken, nonce} = appleAuthRequestResponse;
    const appleCredential = auth.AppleAuthProvider.credential(
      identityToken,
      nonce,
    );

    // Sign the user in with the credential
    const user = auth().signInWithCredential(appleCredential);
    return user;
  };

  const AppleSignIn = () => {
    return (
      <AppleButton
        buttonStyle={AppleButton.Style.WHITE}
        buttonType={AppleButton.Type.SIGN_IN}
        style={{
          width: 160,
          height: 45,
          marginTop: 100,
        }}
        onPress={() =>
          onAppleButtonPress().then(() =>
            console.log('Apple sign-in complete!'),
          )
        }
      />
    );
  };

  const LoginFb = () => {
    return (
      <View>
        <LoginButton
          onLoginFinished={async (error, result) => {
            const currentProfile = Profile.getCurrentProfile().then(
              currentProfile => {
                if (currentProfile) {
                  console.log(JSON.stringify(currentProfile))
                  console.log(
                    'The current logged user is: ' +
                      currentProfile.name +
                      '. His profile id is: ' +
                      currentProfile.userID,
                  );
                }
              },
            );
            if (error) {
              console.log('login has error: ' + result.error);
            } else if (result.isCancelled) {
              console.log('login is cancelled.');
            } else {
              if (Platform.OS === 'ios') {
                AuthenticationToken.getAuthenticationTokenIOS().then(data => {
                  console.log(`ios: ${JSON.stringify(data)}`);
                });
              } else {
                AccessToken.getCurrentAccessToken().then(data => {
                  console.log(`android: ${JSON.stringify(data)}`);
                });
              }
            }
          }}
          onLogoutFinished={() => console.log('logout.')}
          loginTrackingIOS={'limited'}
          nonceIOS={'my_nonce'}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <AppleSignIn />
          <LoginFb />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
