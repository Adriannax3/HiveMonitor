import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { StatusBar } from 'expo-status-bar';
import DeviceModal from "./DeviceModal";

import useBLE from "./useBLE";
import HiveInformation from "./HiveInformation";

export default function App() {

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    data,
    disconnectedFromDevice,
  } = useBLE();


  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if(isPermissionsEnabled) {
      scanForPeripherals();
    }
  }

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const openModal = async () => {
    scanForDevices();
    setIsModalVisible(true);
  };

  useEffect(() => {
    console.log(connectedDevice);
    if(connectedDevice)console.log("jest urzadzenie");
    else console.log("nie ma urzadzenia");
  }, [])


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.mainView}>
        {connectedDevice ? 
        (
          <HiveInformation 
          data={data}
          connectedDevice={connectedDevice}
          disconnectedFromDevice={disconnectedFromDevice}
          />
        )
        :
        (
          <TouchableOpacity
          onPress={openModal}
          style={styles.connectButton}
          >
            <Text style={styles.connectButtonTxt}>Znajdź urządzenie</Text>
          </TouchableOpacity>
        )}

      </View>
      <DeviceModal
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={connectToDevice}
        devices={allDevices}
      />
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
