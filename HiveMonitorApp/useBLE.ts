import { useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { BleError, BleManager, Characteristic, Device } from "react-native-ble-plx";

import * as ExpoDevice from "expo-device"
import base64 from "react-native-base64";

const SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
const CHARACTERISTIC_UUID = "12345678-1234-5678-1234-56789abcdef0"

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
      };
}

function useBLE(): BluetoothLowEnergyApi {
    const bleManager = useMemo(() =>  new BleManager(), []);

    const [allDevices, setAllDevices] = useState<Device[]>([]);
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
    const [data, setData] = useState({
        temperature: null,
        humidity: null,
        weight: null,
      });

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

    const isDuplicateDevice = (devices: Device[], nextDevice: Device) => devices.findIndex((device) => nextDevice.id = device.id) > -1;

    const scanForPeripherals = () => {
        bleManager.startDeviceScan(null, null, (error, device) => {
            if(error) {
                console.log(error);
            }
            if (device && device.name?.includes("HiveMonitor")) {
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
    }

    const onDataUpdate = (error: BleError | null, characteristic: Characteristic | null) => {
        if (error) {
            console.log(error);
            return;
        } else if (!characteristic?.value) {
            console.log("No data received");
            return;
        }
        
        const rawData = base64.decode(characteristic.value);
        console.log(characteristic.value);
        console.log(rawData);
    };

    const startStreamingData = async (device: Device) => {
        if(device) {
            device.monitorCharacteristicForService(
                SERVICE_UUID,
                CHARACTERISTIC_UUID,
                onDataUpdate
            )
        }
        else {
            console.log("No device connected");
        }
    }

    return {
        scanForPeripherals,
        requestPermissions,
        allDevices,
        connectToDevice,
        connectedDevice,
        data
    }
}

export default useBLE;