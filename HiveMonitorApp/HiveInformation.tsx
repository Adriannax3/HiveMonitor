import react, { useEffect, FC, useState } from 'react';
import { Device } from "react-native-ble-plx";
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";

interface Data {
    temperature: number | null;
    humidity: number | null;
    weight: number | null;
}

interface Props {
    data: Data;
    connectedDevice: Device | null;
    disconnectedFromDevice: () => void;
}

const HiveInformation: FC<Props> = ({ data, connectedDevice, disconnectedFromDevice }) => {
    
    const [change, setChange] = useState<boolean>(false);

     useEffect(() => {
        setChange(!change);
        console.log("Current Data:", data);
        console.log("Current Device:", connectedDevice);
      }, [connectedDevice, data])
    

    return (
        <SafeAreaView style={styles.container}>
            {data.humidity || data.temperature || data.weight ? (
                <ScrollView style={styles.scrollView}>
                    <View  style={styles.box}>
                        <View style={styles.boxTitle}>
                            <Text style={styles.boxTitle_Txt}>Ul numer {connectedDevice?.name?.slice(connectedDevice.name?.search('-')+1)}</Text>
                            <Image
                                style={styles.imageHive}
                                source={require('./assets/hive2.png')}
                            />
                        </View>
                        <View>
                            <Text>Aktualna temperatura: {data.temperature}</Text>
                            <Text>Aktualna wilgotność: {data.humidity}</Text>
                            <Text>Aktualna waga: {data.weight}</Text>
                        </View>
                        <View>
                        {data.weightHistory.map((weight, index) => (
                            <Text key={index}>Waga {index + 1}: {weight}</Text>
                        ))}
                        </View>

                        <TouchableOpacity
                                onPress={disconnectedFromDevice}
                                style={styles.btnDisconnect}
                            >
                            <Text>Rozłącz</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            ): (
                <View style={styles.box}>
                    <Text>Ul: {connectedDevice?.name}</Text>
                    <Image source={require('./assets/smartBee.png')} style={styles.beeSmart}/>
                    <Text>Jeszce nie mam informacji :D</Text>
                        <TouchableOpacity
                            onPress={disconnectedFromDevice}
                            style={styles.btnDisconnect}
                        >
                        <Text>Rozłącz</Text>
                        </TouchableOpacity>
                </View>
            )}

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 20,
      padding:0,
      width: '100%',
    },
    beeSmart: {
        width: 300,
        height: 300,
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#f8d3cf',
        width: '100%',
    },
    box: {
        flex: 1,
        height: 800,
        alignItems: 'center'
    },
    boxTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    boxTitle_Txt: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    imageHive: {
        width: 50,
        height: 50,
    },
    btnDisconnect: {
        backgroundColor:  '#f6c90e',
        width: 100,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    }
  });
  

export default HiveInformation;