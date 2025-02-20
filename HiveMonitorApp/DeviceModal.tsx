import React, { FC, useCallback, useEffect } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  Modal,
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from "react-native";
import { Device } from "react-native-ble-plx";

type DeviceModalListItemProps = {
  item: ListRenderItemInfo<Device>;
  connectToPeripheral: (device: Device) => void;
  closeModal: () => void;
};

type DeviceModalProps = {
  devices: Device[];
  visible: boolean;
  connectToPeripheral: (device: Device) => void;
  closeModal: () => void;
  scanForPeripherals: () => void;
};

const DeviceModalListItem: FC<DeviceModalListItemProps> = (props) => {
  const { item, connectToPeripheral, closeModal } = props;

  const connectAndCloseModal = useCallback(() => {
    connectToPeripheral(item.item);
    closeModal();
  }, [closeModal, connectToPeripheral, item.item]);

  return (
    <TouchableOpacity
      onPress={connectAndCloseModal}
      style={modalStyle.ctaButton}
    >
    <ImageBackground source={require('./assets/hive2.png')}  resizeMode="cover" style={modalStyle.image}>
        <Text style={modalStyle.ctaButtonText}>{item.item.name?.slice(item.item.name?.search('-')+1)}</Text>
    </ImageBackground>
    </TouchableOpacity>
  );
};

const DeviceModal: FC<DeviceModalProps> = (props) => {
  const { devices, visible, connectToPeripheral, closeModal } = props;

  useEffect(() => {
    console.log(devices);
  }, [])

  const renderDeviceModalListItem = useCallback(
    (item: ListRenderItemInfo<Device>) => {
      return (
        <DeviceModalListItem
          item={item}
          connectToPeripheral={connectToPeripheral}
          closeModal={closeModal}
        />
      );
    },
    [closeModal, connectToPeripheral]
  );

  return (
    <Modal
      style={modalStyle.modalContainer}
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={closeModal}
    >
      <SafeAreaView style={modalStyle.modalTitle}>
        <Text style={modalStyle.modalTitleText}>
          Choose hive: 
        </Text>
        {devices.length !== 0 ? (
          <FlatList
            contentContainerStyle={modalStyle.modalFlatlistContiner}
            data={devices}
            renderItem={renderDeviceModalListItem}
          />
        ) : 
        <Text style={modalStyle.noDevices_Txt}>No devices nearby...</Text>}
          <TouchableOpacity
            onPress={props.scanForPeripherals} 
            style={modalStyle.btnRefresh}
          >
              <Text style={modalStyle.btnRefresh_Txt}>Refresh</Text>
          </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
};

const modalStyle = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  modalFlatlistContiner: {
    flex: 1,
    justifyContent: "center",
    flexDirection: 'row',
  },
  modalTitle: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    alignItems: 'center',
  },
  modalTitleText: {
    marginTop: 40,
    fontSize: 30,
    fontWeight: "bold",
    marginHorizontal: 20,
    textAlign: "center",
  },
  ctaButton: {
    justifyContent: "center",
    alignItems: "center",
    height: 150,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "black",
    backgroundColor:"#f6c90e",
    minWidth: 50,
    minHeight: 50,
    paddingHorizontal: 10,
    borderRadius: 50,
    textAlign: 'center',
    textAlignVertical: 'center',
    borderWidth: 5,
  },
  scrollView: {
    flex: 1,
  },  
  image: {
    flex: 1,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnRefresh: {
    width: 150,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: '#f8d43f',
    borderColor: "#f6c90e",
    borderWidth: 5,
    marginBottom: 20,
    marginTop: 20,
  },
  btnRefresh_Txt: {
    fontSize: 18,
    color: "black",
    fontWeight: '600',
    paddingHorizontal: 10,
    borderRadius: 50,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  noDevices_Txt: {
    fontSize: 18,
    marginVertical: 20,
  },
});

export default DeviceModal;