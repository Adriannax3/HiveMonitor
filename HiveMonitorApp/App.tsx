import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
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
      <View style={styles.banner}>
        <Text style={styles.bannerTxt}>Hive monitor</Text>
      </View>
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
          <View style={styles.mainViewPad}>
            <View>
              <TouchableOpacity
              onPress={openModal}
              style={styles.connectButton}
              >
                <Text style={styles.connectButtonTxt}>Find device</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.infoBoxWrapper} horizontal={true}>
              <ScrollView style={styles.infoBox}>
                <Text style={styles.infoBoxTitle}>Why is hive temperature important?</Text>
                <Text style={styles.infoBoxTxt}>
                  <Text style={[styles.infoBoxTxt, { fontWeight: 'bold' }]}> • Microclimate regulation: </Text> Bees are highly sensitive to temperature. Maintaining the proper temperature range inside the hive (usually between 34°C and 36°C for larvae and eggs) is essential for the healthy development of young bees.
                </Text>
                <Text style={styles.infoBoxTxt}>
                  <Text style={[styles.infoBoxTxt, { fontWeight: 'bold' }]}> • Colony health: </Text> Too high or too low temperatures can lead to diseases or weaken the bees, affecting their ability to survive winter and produce honey.
                </Text>
                <Text style={styles.infoBoxTxt}>
                  <Text style={[styles.infoBoxTxt, { fontWeight: 'bold' }]}> • Early warning: </Text> Monitoring temperature can indicate ventilation issues inside the hive or external conditions that may require beekeeper intervention.
                </Text>
              </ScrollView>
              <ScrollView style={styles.infoBox}>
                <Text style={styles.infoBoxTitle}>Why is hive humidity important?</Text>
                <Text style={styles.infoBoxTxt}>
                  <Text style={[styles.infoBoxTxt, { fontWeight: 'bold' }]}> • Disease prevention: </Text> Proper humidity levels (typically between 50% and 60%) help prevent the growth of mold and fungi, which can be harmful to bees.
                </Text>
                <Text style={styles.infoBoxTxt}>
                  <Text style={[styles.infoBoxTxt, { fontWeight: 'bold' }]}> • Honey production: </Text> Humidity affects the honey maturation process. Too high humidity can lead to honey fermentation, while too low humidity can cause it to dry out too much.
                </Text>
                <Text style={styles.infoBoxTxt}>
                  <Text style={[styles.infoBoxTxt, { fontWeight: 'bold' }]}> • Bee comfort: </Text> Bees need proper humidity levels to regulate the temperature inside the hive, especially on hot days.
                </Text>
              </ScrollView>
              <ScrollView style={styles.infoBox}>
                <Text style={styles.infoBoxTitle}>Why is monitoring hive weight important?</Text>
                <Text style={styles.infoBoxTxt}>
                  <Text style={[styles.infoBoxTxt, { fontWeight: 'bold' }]}> • Resource monitoring: </Text> The weight of the hive can indicate the amount of stored honey or pollen, which is crucial to assess whether the bees have enough food for the winter.
                </Text>
                <Text style={styles.infoBoxTxt}>
                  <Text style={[styles.infoBoxTxt, { fontWeight: 'bold' }]}> • Hive health: </Text> Changes in weight can also indicate colony growth or problems such as bees abandoning the hive or pest attacks.
                </Text>
                <Text style={styles.infoBoxTxt}>
                  <Text style={[styles.infoBoxTxt, { fontWeight: 'bold' }]}> • Harvest planning: </Text> Helps the beekeeper determine when it is safe to harvest honey without endangering the bees' food supply.
                </Text>
              </ScrollView>
            </ScrollView>
          </View>
        )}

      </View>
      <DeviceModal
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={connectToDevice}
        devices={allDevices}
        scanForPeripherals={scanForPeripherals}
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
    paddingTop: 70,
  },
  banner: {
  paddingVertical: 20,
  paddingHorizontal: 30,
  width: '100%',
  alignItems: 'flex-start',
  justifyContent: 'center',
  },
  bannerTxt: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1, 
    fontStyle: 'italic'
  },
  mainView: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }, 
  mainViewPad: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  scrollView: {
    width: '100%',
    flex:1,
  },
  connectButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#f8d43f',
    borderColor: "#f6c90e",
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  connectButtonTxt: {
    fontWeight: 'bold',
    fontSize: 18
  },
  infoBoxWrapper: {
    flex:1,
    marginTop: 30,
    paddingHorizontal: 20,
    paddingRight: 20,
    paddingBottom: 20,
  },
  infoBox: {
    flex:1,
    width: 300,
    marginTop: 10,
    backgroundColor: '#f8d43f',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 20,
    marginRight: 20,
  },
  infoBoxTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  infoBoxTxt: {
    fontSize: 14,
    lineHeight: 25,
  },
});
