import { useMemo, useState, useEffect } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { BleError, BleManager, Characteristic, Device } from "react-native-ble-plx";

import * as ExpoDevice from "expo-device"
import base64 from "react-native-base64";

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8"


let buffer = "";

interface BluetoothLowEnergyApi {
    requestPermissions(): Promise<boolean>;
    scanForPeripherals(): void;
    allDevices: Device[];
    connectToDevice: (deviceId: Device) => Promise<void>;
    connectedDevice: Device | null;
    data: {
        temperature: number | null;
        humidity: number | null;
        weight: number | null;
        weightHistory: number[];
        temperatureHistory: number[];
        humidityHistory: number[];
      };
    disconnectedFromDevice(): void;
}

function useBLE(): BluetoothLowEnergyApi {
    const bleManager = useMemo(() =>  new BleManager(), []);

    const [allDevices, setAllDevices] = useState<Device[]>([]);
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
    const [data, setData] = useState({
        temperature: null,
        humidity: null,
        weight: null,
        weightHistory: [],
        temperatureHistory: [],
        humidityHistory: [],
      });
    const [deviceDisconnected, setDeviceDisconnected] = useState<boolean>(false);

    useEffect(() => {
        const stateChangeSubscription = bleManager.onStateChange((state) => {
          if (state === 'PoweredOn') {
            console.log('Bluetooth on');
          }
        }, true);
    
        const deviceDisconnectedSubscription = connectedDevice
          ? bleManager.onDeviceDisconnected(connectedDevice.id, (error: BleError | null, device: Device | null) => {
              if (error) {
                console.error('Disconnected error:', error);
              } else {
                setConnectedDevice(null);
                setDeviceDisconnected(true);
              }
            })
          : undefined;
    
        return () => {
          // Czyszczenie nasłuchiwaczy po unmount
          stateChangeSubscription.remove();
          deviceDisconnectedSubscription?.remove();
        };
      }, [bleManager, connectedDevice]);
    


    //////////////////////////////////////////

    const requestAndroid32Permissions = async () => {
        const bluetoothScanPermissions = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, {
                title: "Scan Permission",
                message: "App requires Bluetooth Scanning",
                buttonPositive: "OK",
            }
        );

        const bluetoothConnectPermissions = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT, {
                title: "Connect Permission",
                message: "App requires Bluetooth Connecting",
                buttonPositive: "OK",
            }
        );

        const locationPermissions = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_FINE_LOCATION, {
                title: "Location Permission",
                message: "App requires Location",
                buttonPositive: "OK",
            }
        );

        return (
            bluetoothScanPermissions === "granted" &&
            bluetoothConnectPermissions === "granted" &&
            locationPermissions === "granted"
        );
    }

    const requestPermissions = async () => {
        if(Platform.OS === "android") {
            if((ExpoDevice.platformApiLevel ?? -1) < 32) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: "Location Permission",
                        message: "Bluetooth requires Location",
                        buttonPositive: "OK"
                    }
                )

                return granted === PermissionsAndroid.RESULTS.GRANTED;
            }
            else {
                const isAndroid32PermissionGranted = 
                    await requestAndroid32Permissions();
                return isAndroid32PermissionGranted;
            }
        }
        else {
            return true;
        }
    }

    const isDuplicateDevice = (devices: Device[], nextDevice: Device) => devices.findIndex((device) => nextDevice.id === device.id) > -1;

    const scanForPeripherals = () => {
        setAllDevices([]);
        bleManager.startDeviceScan(null, null, (error, device) => {
            if(error) {
                console.log(error);
            }
            if (device && device.name?.includes("HM")) {
                setAllDevices((prevState) => {
                    if(!isDuplicateDevice(prevState, device)) {
                        return[...prevState, device];
                    }
                    return prevState;
                })
            }
        });
    }

    const connectToDevice = async (device: Device) => {
        try {
            const deviceConnection = await bleManager.connectToDevice(device.id);
            setConnectedDevice(deviceConnection);
            await deviceConnection.discoverAllServicesAndCharacteristics();
            bleManager.stopDeviceScan();
            startStreamingData(deviceConnection);
        }
        catch (e) {
            console.log("ERROR IN CONNECTION: ", e);
        }

        // device.requestMTU(512).then((mtu) => {
        //     console.log(`MTU set to ${mtu}`);
        // });
        
    }

    

    const onDataUpdate = (error: BleError | null, characteristic: Characteristic | null) => {
        if (error) {
            console.error("Error:", error);
            return;
        }
    
        if (!characteristic?.value) {
            return;
        }
    
        try {
            const rawData = base64.decode(characteristic.value);
    
            buffer += rawData;
    
            if (buffer.trim().endsWith('}')) {
                let match = buffer.match(/\{.*\}/s);
                if (match) {
                    console.log(match);
                    const jsonData = JSON.parse(match[0]);
                    handleJsonData(jsonData);
                
                    buffer = buffer.slice(match.index! + match[0].length);
                } else {
                    buffer="";
                }
                buffer="";
            } else {
            }
        } catch (decodeError) {
            buffer="";
            if (decodeError instanceof SyntaxError) {
                console.error("JSON Error:", decodeError);
            } else {
                console.error("JSON encode error:", decodeError);
            }
        }
    };
    
    const handleJsonData = (jsonData: any) => {
        setData((prevData) => ({
            ...prevData,
            humidity: jsonData.currentHumidity,
            temperature: jsonData.currentTemperature,
            weight: jsonData.currentWeight,
            weightHistory: jsonData.lastWeights,
            temperatureHistory: jsonData.lastTemps,
            humidityHistory: jsonData.lastHums,
        }));
    };

    const startStreamingData = async (device: Device) => {
        if(device) {
            device.monitorCharacteristicForService(
                SERVICE_UUID,
                CHARACTERISTIC_UUID,
                (error, characteristic) => {
                    if (error) {
                        console.log("Error while monitoring:", error);
                    } else {
                        onDataUpdate(error, characteristic);
                    }
                }
            )
        }
        else {
            console.log("No device connected");
        }
    }

    const disconnectedFromDevice = () => {
        if (connectedDevice) {
            console.log("Disconnecting from device:", connectedDevice.id);
            bleManager.cancelDeviceConnection(connectedDevice.id)
                .then(() => {
                    console.log("Device disconnected");
                    setConnectedDevice(null);
                    setData({
                        temperature: null,
                        humidity: null,
                        weight: null,
                        weightHistory: [],
                        temperatureHistory: [],
                        humidityHistory: [],
                    });
                })
                .catch((error) => {
                    console.error("Error while disconnecting:", error);
                });
        } else {
            console.log("No device connected");
        }
    };

    return {
        scanForPeripherals,
        requestPermissions,
        allDevices,
        connectToDevice,
        connectedDevice,
        data,
        disconnectedFromDevice
    }
}

export default useBLE;