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
        <Text style={styles.bannerTxt}>Monitor do ula</Text>
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
                <Text style={styles.connectButtonTxt}>Znajdź urządzenie</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.infoBoxWrapper} horizontal={true}>
              <ScrollView style={styles.infoBox}>
                <Text style={styles.infoBoxTitle}>Dlaczego temperatura w ulu jest ważna?</Text>
                <Text style={styles.infoBoxTxt}>
                  <Text style={[styles.infoBoxTxt, { fontWeight: 'bold' }]}> • Regulacja mikroklimatu:   </Text> Pszczoły są bardzo wrażliwe na temperaturę. Utrzymywanie odpowiedniego zakresu temperatury w ulu (zwykle między 34°C a 36°C dla larw i jaj) jest niezbędne do prawidłowego rozwoju młodych pszczół.  
                </Text>
                <Text style={styles.infoBoxTxt}>
                  <Text style={[styles.infoBoxTxt, { fontWeight: 'bold' }]}> • Zdrowie roju: </Text> Zbyt wysoka lub zbyt niska temperatura może prowadzić do chorób lub osłabienia pszczół, wpływając na ich zdolność do przeżycia zimy czy produkcji miodu.  
                </Text>
                <Text style={styles.infoBoxTxt}>
                  <Text style={[styles.infoBoxTxt, { fontWeight: 'bold' }]}> • Wczesne ostrzeżenie:  </Text> Monitorowanie temperatury może wskazywać na problemy z wentylacją w ulu lub na zewnętrzne warunki, które mogą wymagać interwencji pszczelarza.  
                </Text>
              </ScrollView>
              <ScrollView style={styles.infoBox}>
                <Text style={styles.infoBoxTitle}>Dlaczego wilgotność w ulu jest ważna?</Text>
                <Text style={styles.infoBoxTxt}>
                  <Text style={[styles.infoBoxTxt, { fontWeight: 'bold' }]}> • Zapobieganie chorobom:  </Text> Odpowiednia wilgotność (zazwyczaj między 50% a 60%) pomaga zapobiegać rozwojowi pleśni i grzybów, które mogą być szkodliwe dla pszczół.  
                </Text>
                <Text style={styles.infoBoxTxt}>
                  <Text style={[styles.infoBoxTxt, { fontWeight: 'bold' }]}> • Produkcja miodu: </Text> Wilgotność wpływa na proces dojrzewania miodu. Zbyt wysoka wilgotność może prowadzić do fermentacji miodu, a zbyt niska do jego zbytniego wysuszenia.  
                </Text>
                <Text style={styles.infoBoxTxt}>
                  <Text style={[styles.infoBoxTxt, { fontWeight: 'bold' }]}> • Komfort pszczół: </Text>Pszczoły potrzebują odpowiedniego poziomu wilgotności do regulacji temperatury wewnątrz ula, szczególnie w gorące dni.  
                </Text>
              </ScrollView>
              <ScrollView style={styles.infoBox}>
                <Text style={styles.infoBoxTitle}>Dlaczego monitorowanie wagi ula jest ważne?</Text>
                <Text style={styles.infoBoxTxt}>
                  <Text style={[styles.infoBoxTxt, { fontWeight: 'bold' }]}> • Monitorowanie zasobów: </Text> Waga ula może wskazywać na ilość miodu lub pyłku przechowywanego w ulu, co jest kluczowe do oceny, czy pszczoły mają wystarczająco dużo pożywienia na zimę.  
                </Text>
                <Text style={styles.infoBoxTxt}>
                  <Text style={[styles.infoBoxTxt, { fontWeight: 'bold' }]}> • Zdrowie ula:</Text> Zmiany w wadze mogą również wskazywać na rozwój roju lub na problemy, takie jak opuszczenie ula przez pszczoły lub atak szkodników. 
                </Text>
                <Text style={styles.infoBoxTxt}>
                  <Text style={[styles.infoBoxTxt, { fontWeight: 'bold' }]}>• Planowanie zbiorów:</Text> Pomaga pszczelarzowi w określeniu, kiedy można bezpiecznie zbierać miód, nie narażając pszczół na brak pożywienia.
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
