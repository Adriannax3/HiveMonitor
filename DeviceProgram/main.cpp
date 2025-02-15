#include <bluefruit.h>
#include <Adafruit_SHTC3.h>
#include <Wire.h>  // Dodanie biblioteki I2C
#include <HX711_ADC.h>

// Definiujemy UUID dla naszej usługi i charakterystyki
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

#define SHTC3_SDA 21
#define SHTC3_SCL 20

#define HX711_DOUT 4
#define HX711_SCK 5

#define MEASUREMENTS_COUNT 10

float lastMeasurementsWeight[10] = {0};
float lastMeasurementsTemp[10] = {0};
float lastMeasurementsHum[10] = {0};
float currentWeight = 0.00;
float currentTemp =  0.00;
float currentHum = 0.00;

bool isConnect = false;

// DEVICES
HX711_ADC LoadCell(HX711_DOUT, HX711_SCK);
Adafruit_SHTC3 shtc3;

// BLE
BLEService        myService(SERVICE_UUID);
BLECharacteristic myCharacteristic(CHARACTERISTIC_UUID);

// Timer do zapisu danych co 24 godziny
uint32_t lastSaveTime = 0;
const uint32_t SAVE_INTERVAL = 24 * 60 * 60 * 1000;
//24 * 60 * 60 * 1000;  // 24 godziny w milisekundach

void sendDataOverBLE(const String& data) {
  uint8_t chunkSize = 20;  // Maksymalny rozmiar fragmentu
  uint16_t dataLength = data.length();
  uint16_t offset = 0;

  while (offset < dataLength) {
    uint8_t chunkLength = min(chunkSize, dataLength - offset);
    // Konwersja String do const uint8_t* dla notify
    const uint8_t* chunkData = reinterpret_cast<const uint8_t*>(data.c_str()) + offset;
    bool success = myCharacteristic.notify(chunkData, chunkLength);

    offset += chunkLength;
    delay(50);
  }
}

void readFlashData(uint32_t address, float* data, uint32_t length) {
  for (uint32_t i = 0; i < length; i++) {
    uint32_t temp = *(uint32_t*)(address + i * sizeof(float));
    data[i] = *(float*)&temp;
  }
}

void eraseFlashPage(uint32_t address) {
  uint32_t err_code;
  err_code = sd_flash_page_erase(address / NRF_FICR->CODEPAGESIZE);
  if (err_code != NRF_SUCCESS) {
      Serial.println("Błąd kasowania strony FLASH");
  }
}


void writeFlashData(uint32_t address, float* data, uint32_t length) {
  eraseFlashPage(address);  // Najpierw kasujemy stronę

  for (uint32_t i = 0; i < length; i++) {
      uint32_t word = *(uint32_t*)&data[i];
      sd_flash_write((uint32_t*)(address + i * sizeof(float)), &word, 1);
  }
}


void shiftArrayRight(float* array, uint32_t length) {
  for (uint32_t i = length - 1; i > 0; i--) {
    array[i] = array[i - 1];
  }
}

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
  // Waga z ostatnich 10 dni
  jsonData += "\"lastWeights\": [";
  for (int i = 0; i < 10; i++) {
    jsonData += String(lastMeasurementsWeight[i]);
    if (i < 9) jsonData += ", ";
  }
  jsonData += "],";

  // Temperatura z ostatnich 10 dni
  jsonData += "\"lastTemps\": [";
  for (int i = 0; i < 10; i++) {
    jsonData += String(lastMeasurementsTemp[i]);
    if (i < 9) jsonData += ", ";
  }
  jsonData += "],";

  // Wilgotność z ostatnich 10 dni
  jsonData += "\"lastHums\": [";
  for (int i = 0; i < 10; i++) {
    jsonData += String(lastMeasurementsHum[i]);
    if (i < 9) jsonData += ", ";
  }
  jsonData += "],";

  // Aktualne dane
  jsonData += "\"currentWeight\": " + String(weight) + ", ";
  jsonData += "\"currentTemperature\": " + String(temperature.temperature) + ", ";
  jsonData += "\"currentHumidity\": " + String(humidity.relative_humidity);
  jsonData += "}";

  sendDataOverBLE(jsonData);
  isConnect = false;
}

void saveMeasurements() {
  shiftArrayRight(lastMeasurementsWeight, MEASUREMENTS_COUNT);
  shiftArrayRight(lastMeasurementsTemp, MEASUREMENTS_COUNT);
  shiftArrayRight(lastMeasurementsHum, MEASUREMENTS_COUNT);

  float newWeight = LoadCell.getData();
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

void onConnectCallback(uint16_t conn_handle) {
  Serial.println("Połączono z BLE!");
  isConnect = true;
  takeMeasurements_Time();  // Wykonaj pomiary tylko raz przy połączeniu
}

void onDisconnectCallback(uint16_t conn_handle, uint8_t reason) {
  Serial.println("Rozłączono z BLE!");
  isConnect = false;
}

void setup() 
{
  Serial.begin(115200);

  // Inicjalizacja Bluefruit
  Bluefruit.configPrphBandwidth(BANDWIDTH_MAX);
  Bluefruit.begin();
  Bluefruit.setName("HM-1");

  // Konfiguracja usługi BLE
  myService.begin();

  // Konfiguracja charakterystyki
  myCharacteristic.setProperties(CHR_PROPS_READ | CHR_PROPS_NOTIFY);
  myCharacteristic.setPermission(SECMODE_OPEN, SECMODE_NO_ACCESS);
  myCharacteristic.begin();

  // Konfiguracja reklamy (Advertising)
  Bluefruit.Advertising.addFlags(BLE_GAP_ADV_FLAGS_LE_ONLY_GENERAL_DISC_MODE);
  Bluefruit.Advertising.addService(myService);
  Bluefruit.Advertising.addName();

  Bluefruit.Advertising.restartOnDisconnect(true);
  Bluefruit.Advertising.setInterval(32, 244);    // w milisekundach
  Bluefruit.Advertising.setFastTimeout(30);      // liczba sekund w trybie szybkiego nadawania

  Bluefruit.Advertising.start();

  Wire.setPins(SHTC3_SDA, SHTC3_SCL);
  Wire.begin();

  if (!shtc3.begin(&Wire)) {
    Serial.println("Błąd inicjalizacji czujnika SHTC3!");
  }

  LoadCell.begin();  // Inicjalizacja HX711
  LoadCell.start(2000);  // Czekaj 2 sekundy na stabilizację
  LoadCell.setCalFactor(23.8);  // Ustaw współczynnik kalibracji

  // Ustaw callbacki dla połączenia i rozłączenia BLE
  Bluefruit.Periph.setConnectCallback(onConnectCallback);
  Bluefruit.Periph.setDisconnectCallback(onDisconnectCallback);

  Serial.println("BLE zainicjalizowane, reklamowanie rozpoczęte...");
}

void loop() 
{
  static unsigned long lastSend = 0;
  
  if (Bluefruit.connected()) {
    if (millis() - lastSend >= 1500) {  // Wysyłaj co 1 sekundę
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

  delay(5000);
}
