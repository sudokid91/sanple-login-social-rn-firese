/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useEffect} from 'react';
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
  Button,
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
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import messaging from '@react-native-firebase/messaging';

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [userInfo, setUSerInfo] = useState(null)

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  GoogleSignin.configure({
    webClientId: '179172327382-vk8asoie2f3g23tp6juj6m9385r3cpeu.apps.googleusercontent.com'
  });

  const  listerNotifications = message => {
      console.log(`listerNotifications: ${JSON.stringify(message)}`)
  }

  useEffect(() => {
      // Assume a message-notification contains a "type" property in the data payload of the screen to open

      messaging().subscribeToTopic("hoangnn").then(data => console.log(`topic hoangnnn: ${JSON.stringify(data)}`)).catch()

    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
          'Notification caused app to open from background state:',
          remoteMessage.notification,
      );
      // navigation.navigate(remoteMessage.data.type);
    });

    // Check whether an initial notification is available
    messaging()
        .getInitialNotification()
        .then(remoteMessage => {
          if (remoteMessage) {
            console.log(
                'Notification caused app to open from quit state:',
                remoteMessage.notification,
            );
            // setInitialRoute(remoteMessage.data.type); // e.g. "Settings"
          }
          // setLoading(false);
        });
  }, []);


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

  const onGoogleButtonPress = async () => {
    // Get the users ID token
    if (userInfo) {
        try {
          await GoogleSignin.revokeAccess();
          await GoogleSignin.signOut();
          setUSerInfo(null) // Remember to remove the user from your app's state as well
        } catch (error) {
          console.error(error);
        }
    } else {
      const userInfo = await GoogleSignin.signIn();
      console.log(JSON.stringify(userInfo))
      setUSerInfo(userInfo)
      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(userInfo?.idToken);

      // Sign-in the user with the credential
      return auth().signInWithCredential(googleCredential);
    }

  }

  const LoginGoogle = () => {
    return (
        <View>
          <Button
              title={userInfo ? "Logout" : "Login"}
              onPress={() => onGoogleButtonPress().then(() => console.log(userInfo ? 'LogOuted in with Google!' :'Signed in with Google!'))}
          />
        </View>
    )

  }

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
          <LoginGoogle/>
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
