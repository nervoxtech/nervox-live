#include "NerVox.h"

NerVox nervox;

void setup() {
  nervox.begin();
}

void loop() {
  nervox.loop();

  if (nervox.isConnected()) {
    Serial.println("[Test] Device is connected to WiFi.");
    Serial.println("[Test] Device MAC: " + nervox.getDeviceID());
    delay(5000);
  }
}