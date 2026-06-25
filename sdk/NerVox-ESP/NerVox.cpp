#include "NerVox.h"

NerVox::NerVox() : _server(80) {
  _provisioned = false;
  _connected = false;
}

void NerVox::begin() {
  Serial.begin(115200);
  delay(500);

  pinMode(NERVOX_RESET_PIN, INPUT_PULLUP);

  _generateAPName();

  if (_checkResetButton()) {
    Serial.println("[NerVox] Reset button held. Clearing credentials...");
    _clearCredentials();
    Serial.println("[NerVox] Credentials cleared. Starting provisioning...");
    _startProvisioning();
    return;
  }

  _loadCredentials();

  if (_provisioned) {
    Serial.println("[NerVox] Credentials found. Connecting to WiFi...");
    _startWiFi();
  } else {
    Serial.println("[NerVox] No credentials found. Starting provisioning...");
    _startProvisioning();
  }
}

void NerVox::loop() {
  if (!_provisioned) {
    _server.handleClient();
  }
}

bool NerVox::isConnected() {
  return _connected;
}

String NerVox::getDeviceID() {
  return _macAddress;
}

bool NerVox::_checkResetButton() {
  if (digitalRead(NERVOX_RESET_PIN) == LOW) {
    Serial.println("[NerVox] Reset button detected. Hold for 5 seconds to reset...");
    unsigned long pressStart = millis();
    while (digitalRead(NERVOX_RESET_PIN) == LOW) {
      if (millis() - pressStart >= NERVOX_RESET_HOLD_MS) {
        Serial.println("[NerVox] Reset confirmed.");
        return true;
      }
      delay(100);
    }
    Serial.println("[NerVox] Reset cancelled. Button released early.");
  }
  return false;
}

void NerVox::_generateAPName() {
  WiFi.mode(WIFI_STA);
  WiFi.begin();
  delay(500);
  _macAddress = WiFi.macAddress();
  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);
  delay(100);
  String suffix = _macAddress;
  suffix.replace(":", "");
  suffix = suffix.substring(6);
  _apName = "NerVox-" + suffix;
  Serial.println("[NerVox] Device MAC: " + _macAddress);
  Serial.println("[NerVox] AP Name: " + _apName);
}

void NerVox::_loadCredentials() {
  _prefs.begin("nervox", false);
  _ssid = _prefs.getString("ssid", "");
  _password = _prefs.getString("password", "");
  _orgToken = _prefs.getString("orgToken", "");
  _prefs.end();

  if (_ssid.length() > 0) {
    _provisioned = true;
  }
}

void NerVox::_saveCredentials(String ssid, String password, String orgToken) {
  _prefs.begin("nervox", false);
  _prefs.putString("ssid", ssid);
  _prefs.putString("password", password);
  _prefs.putString("orgToken", orgToken);
  _prefs.end();
  Serial.println("[NerVox] Credentials saved.");
}

void NerVox::_clearCredentials() {
  _prefs.begin("nervox", false);
  _prefs.clear();
  _prefs.end();
  _provisioned = false;
  _connected = false;
  _ssid = "";
  _password = "";
  _orgToken = "";
}

void NerVox::_startWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(_ssid.c_str(), _password.c_str());

  Serial.print("[NerVox] Connecting");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    _connected = true;
    Serial.println("");
    Serial.println("[NerVox] WiFi Connected.");
    Serial.println("[NerVox] IP: " + WiFi.localIP().toString());
  } else {
    _connected = false;
    Serial.println("");
    Serial.println("[NerVox] WiFi connection failed. Starting provisioning...");
    _startProvisioning();
  }
}

void NerVox::_startProvisioning() {
  WiFi.mode(WIFI_AP);
  WiFi.softAP(_apName.c_str());

  Serial.println("[NerVox] Provisioning mode started.");
  Serial.println("[NerVox] Connect to: " + _apName);
  Serial.println("[NerVox] Open: 192.168.4.1");

  _server.on("/", [this]() { _handleRoot(); });
  _server.on("/save", HTTP_POST, [this]() { _handleSave(); });
  _server.begin();
}

void NerVox::_handleRoot() {
  String html = R"(
<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1'>
  <title>NerVox Setup</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Inter, sans-serif;
      background: #ffffff;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      width: 100%;
      max-width: 400px;
    }
    .logo {
      font-size: 24px;
      font-weight: 700;
      color: #0EA5E9;
      margin-bottom: 8px;
    }
    .subtitle {
      font-size: 14px;
      color: #64748B;
      margin-bottom: 32px;
    }
    label {
      display: block;
      font-size: 13px;
      color: #0A0F1E;
      margin-bottom: 6px;
    }
    input {
      width: 100%;
      padding: 12px 14px;
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      font-size: 14px;
      color: #0A0F1E;
      margin-bottom: 16px;
      outline: none;
    }
    input:focus {
      border-color: #0EA5E9;
    }
    button {
      width: 100%;
      padding: 12px;
      background: #0EA5E9;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    button:hover {
      background: #0284C7;
    }
    .footer {
      margin-top: 32px;
      font-size: 12px;
      color: #94A3B8;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class='card'>
    <div class='logo'>NerVox</div>
    <div class='subtitle'>Device Setup — Connect to your network</div>
    <form action='/save' method='POST'>
      <label>WiFi Network (SSID)</label>
      <input type='text' name='ssid' placeholder='Enter WiFi name' required>
      <label>WiFi Password</label>
      <input type='password' name='password' placeholder='Enter WiFi password'>
      <label>Organisation Token</label>
      <input type='text' name='orgToken' placeholder='Enter org token from NerVox dashboard' required>
      <button type='submit'>Connect Device</button>
    </form>
    <div class='footer'>nervox.live</div>
  </div>
</body>
</html>
  )";
  _server.send(200, "text/html", html);
}

void NerVox::_handleSave() {
  String ssid = _server.arg("ssid");
  String password = _server.arg("password");
  String orgToken = _server.arg("orgToken");

  if (ssid.length() == 0 || orgToken.length() == 0) {
    _server.send(400, "text/plain", "SSID and Org Token are required.");
    return;
  }

  _saveCredentials(ssid, password, orgToken);

  String html = R"(
<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1'>
  <title>NerVox Setup</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Inter, sans-serif;
      background: #ffffff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      text-align: center;
      max-width: 400px;
    }
    .logo {
      font-size: 24px;
      font-weight: 700;
      color: #0EA5E9;
      margin-bottom: 16px;
    }
    .message {
      font-size: 16px;
      color: #0A0F1E;
      margin-bottom: 8px;
    }
    .sub {
      font-size: 14px;
      color: #64748B;
    }
  </style>
</head>
<body>
  <div class='card'>
    <div class='logo'>NerVox</div>
    <div class='message'>Device configured successfully.</div>
    <div class='sub'>Rebooting and connecting to your network...</div>
  </div>
</body>
</html>
  )";

  _server.send(200, "text/html", html);
  delay(2000);
  ESP.restart();
}