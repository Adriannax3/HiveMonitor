# HiveMonitor
Author's design of the hive monitor, its software and application for its operation.

## Hardware
The device is based on NRF52840. The temperature and humidity sensor is the SHTC3 module. The device has four strain gauge sensors working in parallel. Strain sensors are connected to HX711. The hive monitor has a battery and is charged by a solar panel.

## Software
The NRF broadcasts BLE. When a BLE connection is established, sensor readings are collected and then transmitted along with readings from the last 10 days via BLE. The device also takes readings every 24 hours.

## App
The application was created using React Native and Typescript. It allows you to easily connect to HiveMonitor via BLE, download data and display it aesthetically.

<img src="https://github.com/user-attachments/assets/e297f839-22a4-4f6f-a425-6406c1c9fcb6" style="width: 400px;">
<img src="https://github.com/user-attachments/assets/bcc8de04-856e-4a42-ac7f-ce1e3cdf0f29" style="width: 400px;">
<img src="https://github.com/user-attachments/assets/d8c8b821-3999-463e-87ce-fc933fa33a55" style="width: 400px;">
<img src="https://github.com/user-attachments/assets/6507e32f-c2b7-4b3f-81aa-6c5dfff6aedc" style="width: 400px;">
<img src="https://github.com/user-attachments/assets/e2c0e2d9-d14f-46a8-b7fb-599a58e8b6f6" style="width: 400px;">

