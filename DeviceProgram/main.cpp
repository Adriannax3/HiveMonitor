#include <bluefruit.h>
#include <Adafruit_SHTC3.h>
#include <Wire.h>  // Dodanie biblioteki I2C
#include <HX711_ADC.h>
// Definiujemy UUID dla naszej usługi i charakterystyki
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

#define SHTC3_SDA 21
#define SHTC3_SCL 20

#define HX711_DOUT 12
#define HX711_SCK 13

HX711_ADC LoadCell(HX711_DOUT, HX711_SCK);

// Obiekt dla usługi i charakterystyki BLE
BLEService        myService(SERVICE_UUID);
BLECharacteristic myCharacteristic(CHARACTERISTIC_UUID);

Adafruit_SHTC3 shtc3;

void setup() 
{
  Serial.begin(115200);

  Serial.println("Inicjalizacja BLE...");

  // Inicjalizacja Bluefruit
  Bluefruit.begin();
  Bluefruit.setName("HiveMonitor-1");

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

  float calibrationValue = 23.8;
  LoadCell.setCalFactor(calibrationValue);

  Serial.println("BLE zainicjalizowane, reklamowanie rozpoczęte...");
}

void loop() 
{
  static unsigned long lastSend = 0;
  if (millis() - lastSend > 5000)
  {
    float temp1=0.0, hum=0.0;

    sensors_event_t humidity, temp;
    if (shtc3.getEvent(&humidity, &temp)) {
      temp1 = temp.temperature;
      hum = humidity.relative_humidity;
    }
    float weight = LoadCell.getData();

    char data[64];
    snprintf(data, sizeof(data), "T: %.2f C, H: %.2f%%, W: %.2f g", temp1, hum, weight);
    lastSend = millis();
    myCharacteristic.notify((uint8_t*)data, strlen(data));
    Serial.println("Wysłano \"Hello\" przez BLE.");
  }
}