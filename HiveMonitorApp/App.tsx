import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { StatusBar } from 'expo-status-bar';

export default function App() {



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.mainView}>
        <Image source={require('./assets/beeIcon.png')} />
        <TouchableOpacity
        // onPress={connectedDevice ? disconnectFromDevice : openModal}
        style={styles.connectButton}
        >
          <Text style={styles.connectButtonTxt}>Znajdź urządzenie</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6c90e',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  mainView: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#f6c90e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10
  },
  connectButtonTxt: {
    fontWeight: 'bold',
    fontSize: 18
  },
});
