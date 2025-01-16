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
  Dimensions,
} from "react-native";
import {
    LineChart,
    BarChart,
    PieChart,
    ProgressChart,
    ContributionGraph,
    StackedBarChart
  } from "react-native-chart-kit";
  import * as Animatable from 'react-native-animatable';


interface Data {
    temperature: number | null;
    humidity: number | null;
    weight: number | null;
    weightHistory: number[] | null;
    temperatureHistory: number[] | null;
    humidityHistory: number[] | null;
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
                        <Animatable.View animation="slideInLeft" duration={1000} easing="ease-in-out" style={styles.boxCurrentInformation}>
                            {/* Icons created by Freepik - Flaticon */}
                            <View style={styles.infoRow}>
                                <Image source={require('./assets/thermometer.png')} style={styles.dataIcon} />
                                <Text style={styles.boxCurrentInformation_Txt}>{data.temperature}°C</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Image source={require('./assets/humidity.png')} style={styles.dataIcon} />
                                <Text style={styles.boxCurrentInformation_Txt}>{data.humidity} %</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Image source={require('./assets/unit.png')} style={styles.dataIcon} />
                                <Text style={styles.boxCurrentInformation_Txt}>{data.weight} kg</Text>
                            </View>
                        </Animatable.View>
                            <View style={styles.boxChart}>
                            <Text style={styles.boxChartTitle}>Ostatnie 10 dni waga</Text>
                            <LineChart
                                    data={{
                                        labels: data.weightHistory.map((_, index) => `${0 - index}`), // Etykiety na osi X
                                        datasets: [
                                            {
                                            data: data.weightHistory, // Dane wagowe
                                            strokeWidth: 2, // Grubość linii
                                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                            },
                                        ],
                                    }}
                                    width={Dimensions.get("window").width} // from react-native
                                    height={220}
                                    xAxisLabel="day"
                                    yAxisLabel=""
                                    yAxisSuffix="kg"
                                    yAxisInterval={1}
                                    chartConfig={{
                                        backgroundColor: "#f8d43f",
                                        backgroundGradientFrom: "#f8d43f",
                                        backgroundGradientTo: "#f8d43f",
                                    decimalPlaces: 2,
                                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                    style: {
                                        borderRadius: 16
                                    },
                                    propsForDots: {
                                        r: "6",
                                        strokeWidth: "2",
                                        stroke: "#000"
                                    }
                                    }}
                                    bezier
                                    style={{
                                    marginVertical: 8,
                                    borderRadius: 0
                                    }}
                                />
                            </View>

                            <View style={styles.boxChart}>
                            <Text style={styles.boxChartTitle}>Ostatnie 10 dni temperatura</Text>
                            <LineChart
                                    data={{
                                        labels: data.temperatureHistory.map((_, index) => `${0 - index}`), // Etykiety na osi X
                                        datasets: [
                                            {
                                            data: data.temperatureHistory, // Dane wagowe
                                            strokeWidth: 2, // Grubość linii
                                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                            },
                                        ],
                                    }}
                                    width={Dimensions.get("window").width} // from react-native
                                    height={220}
                                    xAxisLabel="day"
                                    yAxisLabel=""
                                    yAxisSuffix="°C"
                                    yAxisInterval={1}
                                    chartConfig={{
                                        backgroundColor: "#f8d43f",
                                        backgroundGradientFrom: "#f8d43f",
                                        backgroundGradientTo: "#f8d43f",
                                    decimalPlaces: 2,
                                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                    style: {
                                        borderRadius: 16
                                    },
                                    propsForDots: {
                                        r: "6",
                                        strokeWidth: "2",
                                        stroke: "#000"
                                    }
                                    }}
                                    bezier
                                    style={{
                                    marginVertical: 8,
                                    borderRadius: 0
                                    }}
                                />
                            </View>                        

                            <View style={styles.boxChart}>
                            <Text style={styles.boxChartTitle}>Ostatnie 10 dni wilgotność</Text>
                            <LineChart
                                    data={{
                                        labels: data.humidityHistory.map((_, index) => `${0 - index}`), // Etykiety na osi X
                                        datasets: [
                                            {
                                            data: data.humidityHistory, // Dane wagowe
                                            strokeWidth: 2, // Grubość linii
                                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                            },
                                        ],
                                    }}
                                    width={Dimensions.get("window").width} // from react-native
                                    height={220}
                                    xAxisLabel="day"
                                    yAxisLabel=""
                                    yAxisSuffix="%"
                                    yAxisInterval={1}
                                    chartConfig={{
                                        backgroundColor: "#f8d43f",
                                        backgroundGradientFrom: "#f8d43f",
                                        backgroundGradientTo: "#f8d43f",
                                    decimalPlaces: 2,
                                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                    style: {
                                        borderRadius: 16
                                    },
                                    propsForDots: {
                                        r: "6",
                                        strokeWidth: "2",
                                        stroke: "#000"
                                    }
                                    }}
                                    bezier
                                    style={{
                                    marginVertical: 8,
                                    borderRadius: 0
                                    }}
                                />
                            </View>                        


                        <TouchableOpacity
                                onPress={disconnectedFromDevice}
                                style={styles.btnDisconnect}
                            >
                            <Text style={styles.btnDisconnect_Txt}>Rozłącz</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            ): (
                <View style={styles.boxWaiting}>
                    <Image source={require('./assets/beesScientist.png')} style={styles.beeSmart}/>
                    <Animatable.Text
                            animation="flipInX" // Użycie wbudowanej animacji
                            iterationCount="infinite" // Powtarzanie animacji w nieskończoność
                            direction="alternate" // Animacja wraca do punktu początkowego
                            style={styles.boxWaiting_Txt}
                        >
                            Zbieram informacje...
                        </Animatable.Text>
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
      padding:0,
      width: '100%',
    },
    beeSmart: {
        resizeMode: 'contain',
        width: '100%',
        maxHeight: 300,
    },
    scrollView: {
        flex: 1,
        paddingVertical: 20,
        width: '100%',
        height: '100%',
    },
    box: {
        flex: 1,
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
    boxCurrentInformation: {
        padding: 20,
        flex: 1,
        width: '100%',
        marginBottom: 0,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: '#f8d43f',
        borderColor: "#f6c90e",
        borderWidth: 5,
        padding: 10,
        borderRadius: 20,
    },
    boxCurrentInformation_Txt: {
        fontSize: 18,
        fontWeight: '600',
    },
    dataIcon: {
        width: 40,
        height: 40,
        resizeMode: 'cover',
        marginRight: 10,
    },
    boxChart: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8d43f',
        marginVertical: 10,
        paddingVertical: 10,
        borderColor: "#f6c90e",
        borderWidth: 5,
        padding: 10,
    },
    boxChartTitle: {
        fontWeight: 'bold',
        fontSize: 24,
    },
    btnDisconnect: {
        backgroundColor: '#f8d43f',
        borderColor: "#f6c90e",
        borderWidth: 5,
        width: 200,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        marginBottom: 50,
    },
    btnDisconnect_Txt: {
        fontWeight: '600'
    },
    boxWaiting: {
        flex: 1,
        width:'100%',
        height: 800,
        alignItems: 'center',
        justifyContent: 'center',
    },
    boxWaiting_Txt: {
        marginVertical: 20,
        fontWeight: "600",
        fontSize: 24,
    }
  });
  

export default HiveInformation;