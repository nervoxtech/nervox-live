#ifndef NERVOX_H
#define NERVOX_H

#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <Preferences.h>

#define NERVOX_RESET_PIN 0
#define NERVOX_RESET_HOLD_MS 5000

class NerVox {
  public:
    NerVox();
    void begin();
    void loop();
    bool isConnected();
    String getDeviceID();

  private:
    WebServer _server;
    Preferences _prefs;

    String _ssid;
    String _password;
    String _orgToken;
    String _macAddress;
    String _apName;

    bool _provisioned;
    bool _connected;

    void _loadCredentials();
    void _saveCredentials(String ssid, String password, String orgToken);
    void _clearCredentials();
    void _startProvisioning();
    void _startWiFi();
    void _handleRoot();
    void _handleSave();
    void _generateAPName();
    bool _checkResetButton();
};

#endif