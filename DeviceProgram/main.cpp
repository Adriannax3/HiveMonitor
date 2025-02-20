#include <Adafruit_TinyUSB.h> 
#include <HX711_ADC.h>
#include <Wire.h>
#include <Adafruit_SHTC3.h>
#include <bluefruit.h>

#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

//HX711 pins
const int HX711_dout = 20;
const int HX711_sck = 21;
//SHCT3 pins
const int SHTC3_SDA = 2;
const int SHTC3_SCL = 3;

const int MEASUREMENTS_COUNT = 10;

float lastMeasurementsWeight[10] = {0};
float lastMeasurementsTemp[10] = {0};
float lastMeasurementsHum[10] = {0};
float currentWeight = 0.00;
float currentTemp =  0.00;
float currentHum = 0.00;

// Create HX711 and SHTC3 objects
HX711_ADC LoadCell(HX711_dout, HX711_sck);
Adafruit_SHTC3 shtc3;

// BLE
BLEService        myService(SERVICE_UUID);
BLECharacteristic myCharacteristic(CHARACTERISTIC_UUID);

// time internal value
uint32_t lastSaveTime = 0;
const uint32_t SAVE_INTERVAL = 24 * 60 * 60 * 1000;

// function that sends data via BLE
void sendDataOverBLE(const String& data) {
  uint8_t chunkSize = 20;
  uint16_t dataLength = data.length();
  uint16_t offset = 0;

  while (offset < dataLength) {
    uint8_t chunkLength = min(chunkSize, dataLength - offset);
    const uint8_t* chunkData = reinterpret_cast<const uint8_t*>(data.c_str()) + offset;
    bool success = myCharacteristic.notify(chunkData, chunkLength);

    offset += chunkLength;
    delay(50);
  }
}

// moving the array to the right
void shiftArrayRight(float* array, uint32_t length) {
  for (uint32_t i = length - 1; i > 0; i--) {
    array[i] = array[i - 1];
  }
}

// reading from sensors with BLE connection
void takeMeasurements_Time() {
  const int numMeasurements = 50;
  float measurements[numMeasurements];
   for (int i = 0; i < numMeasurements; i++) {
      measurements[i] = LoadCell.getData();
    delay(10);
  }

  for (int i = 0; i < numMeasurements - 1; i++) {
    for (int j = i + 1; j < numMeasurements; j++) {
      if (measurements[i] > measurements[j]) {
        float temp = measurements[i];
        measurements[i] = measurements[j];
        measurements[j] = temp;
      }
    }
  }

  int discardCount = numMeasurements / 10;
  float sum = 0;
  for (int i = discardCount; i < numMeasurements - discardCount; i++) {
    sum += measurements[i];
  }

  float weight = sum / (numMeasurements - 2 * discardCount);
  weight = fabs(weight) / 1000;

  float tempWeight = weight;
  float tempTemp = 0.0;
  float tempHum = 0.0;

  sensors_event_t humidity, temperature;
  if (shtc3.getEvent(&humidity, &temperature)) {
    tempTemp = (temperature.temperature);
    tempHum = (humidity.relative_humidity);
  } else {
    Serial.println("Failed to read from SHTC3 sensor!");
  }

  String jsonData = "{";
  // last 10 days weights
  jsonData += "\"lastWeights\": [";
  for (int i = 0; i < 10; i++) {
    jsonData += String(lastMeasurementsWeight[i]);
    if (i < 9) jsonData += ", ";
  }
  jsonData += "],";

  // last 10 days temperatures
  jsonData += "\"lastTemps\": [";
  for (int i = 0; i < 10; i++) {
    jsonData += String(lastMeasurementsTemp[i]);
    if (i < 9) jsonData += ", ";
  }
  jsonData += "],";

  // last 10 days humidity
  jsonData += "\"lastHums\": [";
  for (int i = 0; i < 10; i++) {
    jsonData += String(lastMeasurementsHum[i]);
    if (i < 9) jsonData += ", ";
  }
  jsonData += "],";

  // current data
  jsonData += "\"currentWeight\": " + String(weight) + ", ";
  jsonData += "\"currentTemperature\": " + String(temperature.temperature) + ", ";
  jsonData += "\"currentHumidity\": " + String(humidity.relative_humidity);
  jsonData += "}";

  sendDataOverBLE(jsonData);
}

// recording sensor readings every 24 hours
void saveMeasurements() {
  shiftArrayRight(lastMeasurementsWeight, MEASUREMENTS_COUNT);
  shiftArrayRight(lastMeasurementsTemp, MEASUREMENTS_COUNT);
  shiftArrayRight(lastMeasurementsHum, MEASUREMENTS_COUNT);

  float newWeight = LoadCell.getData() / 1000;
  if(isnan(newWeight)) { newWeight = 0.0; }
  float newTemp = 0.0;
  float newHum = 0.0;

  sensors_event_t humidity, temperature;
  if (shtc3.getEvent(&humidity, &temperature)) {
    newTemp = (temperature.temperature);
    newHum = (humidity.relative_humidity);
  } 
  lastMeasurementsWeight[0] = newWeight;
  lastMeasurementsTemp[0] = newTemp;
  lastMeasurementsHum[0] = newHum;
}

// BLE callbacks
void onConnectCallback(uint16_t conn_handle) {
  Serial.println("Połączono z BLE!");
  takeMeasurements_Time();
}

void onDisconnectCallback(uint16_t conn_handle, uint8_t reason) {
  Serial.println("Rozłączono z BLE!");
}

// setup
void setup() {
  Serial.begin(9600);

  //BLE
  Bluefruit.configPrphBandwidth(BANDWIDTH_MAX);
  Bluefruit.begin();
  Bluefruit.setName("HM-1");

  myService.begin();

  myCharacteristic.setProperties(CHR_PROPS_READ | CHR_PROPS_NOTIFY);
  myCharacteristic.setPermission(SECMODE_OPEN, SECMODE_NO_ACCESS);
  myCharacteristic.begin();

  Bluefruit.Advertising.addFlags(BLE_GAP_ADV_FLAGS_LE_ONLY_GENERAL_DISC_MODE);
  Bluefruit.Advertising.addService(myService);
  Bluefruit.Advertising.addName();

  Bluefruit.Advertising.restartOnDisconnect(true);
  Bluefruit.Advertising.setInterval(32, 244);
  Bluefruit.Advertising.setFastTimeout(30);

  //HX711
  pinMode(HX711_dout, INPUT);
  pinMode(HX711_sck, OUTPUT);
  delay(500);
  LoadCell.begin();

  unsigned long stabilizingtime = 2000;
  boolean _tare = true;
  LoadCell.start(stabilizingtime, _tare);

  if (LoadCell.getTareTimeoutFlag()) {
    Serial.println("Error: Timeout during tare. Check the HX711 connections.");
  }
  if (LoadCell.getSignalTimeoutFlag()) {
    Serial.println("Error: Timeout while reading signal. Check the HX711 connections.");
  }

  LoadCell.setCalFactor(23.8);

  // SHTC3
  Wire.setPins(SHTC3_SDA, SHTC3_SCL);
  Wire.begin();

  if (!shtc3.begin(&Wire)) {
      Serial.println("SHTC3 sensor initialization error!");
      delay(500);
    } else {
        Serial.println("SHTC3 sensor initalizated");
    }

  // BLE start
  Bluefruit.Advertising.start();
  Bluefruit.Periph.setConnectCallback(onConnectCallback);
  Bluefruit.Periph.setDisconnectCallback(onDisconnectCallback);

  Serial.println("Started...");
}

// loop
void loop() {
  if (LoadCell.update()) {
    float reading = LoadCell.getData();
    if (!isnan(reading)) {
      Serial.print("Reading from HX711: ");
      Serial.println(reading);
    } else {
      Serial.println("Error: Invalid reading (NaN). Check connections and power.");
    }
  } else {
    Serial.println("Error: No new data from HX711. Check connections.");
  }

  static unsigned long lastSend = 0;
  
  if (Bluefruit.connected()) {
    if (millis() - lastSend >= 1500) {
      takeMeasurements_Time();
      lastSend = millis();
    }
  }

  if (millis() - lastSaveTime >= SAVE_INTERVAL) {
    saveMeasurements();
    lastSaveTime = millis();
  }

  if(millis() < lastSaveTime) {
    lastSaveTime = 0;
  }

  delay(1000);
}