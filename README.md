# WeatherIoT-PicoStation

[![Python](https://img.shields.io/badge/python-3.7+-blue.svg)](https://www.python.org/downloads/)
[![MicroPython](https://img.shields.io/badge/micropython-1.19+-yellow.svg)](https://micropython.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌡️ Overview

WeatherIoT-PicoStation is a comprehensive IoT weather monitoring system built on the Raspberry Pi Pico W platform. The system collects environmental data (temperature and pressure) using the BMP280 sensor, processes it locally, and transmits it to cloud services for storage and visualization.

### Key Features
- Real-time temperature and pressure monitoring
- Automatic Wi-Fi configuration with fallback AP mode
- Secure MQTT data transmission
- Cloud storage with InfluxDB
- Web-based visualization
- Grafana dashboards

## 🏗️ System Architecture

### Hardware Layer
- Raspberry Pi Pico W controller
- BMP280 environmental sensor
- I2C communication protocol
- GPIO configuration:
  - SDA: GPIO 4
  - SCL: GPIO 5
  - Power: 3.3V

### Software Layer
1. **Embedded System**
   - MicroPython runtime
   - I2C sensor communication
   - Wi-Fi management
   - MQTT client implementation

2. **Cloud Infrastructure**
   - HiveMQ broker for data relay
   - InfluxDB for data storage
   - Telegraf for data collection
   - Next.js web application
   - Grafana dashboards

## 🛠️ Setup Instructions

### Hardware Setup

1. Connect BMP280 sensor to Pico W:
   - SDA → GPIO 4
   - SCL → GPIO 5
   - VCC → 3.3V
   - GND → GND

### Software Setup

1. Flash MicroPython to Pico W:
```bash
# Download latest MicroPython firmware
# Flash using your preferred method
```

2. Install project files:
```bash
# Clone repository
git clone https://github.com/yourusername/WeatherIoT-PicoStation.git
cd WeatherIoT-PicoStation

# Copy files to Pico W
# Use Thonny or your preferred method
```

3. Configure settings:
```python
# Edit config.py with your credentials
SSID = "your_wifi_ssid"
PASSWORD = "your_wifi_password"
BROKER_ADDRESS = "your_mqtt_broker"
```

### Cloud Setup

1. HiveMQ Setup:
```bash
# Configure HiveMQ broker
# Set up authentication
```

2. InfluxDB Setup:
```bash
# Create InfluxDB bucket
# Generate API tokens
```

3. Telegraf Configuration:
```bash
# Install Telegraf
# Copy telegraf.conf to /etc/telegraf/
# Start Telegraf service
```

4. Web Application:
```bash
cd web
npm install
npm run dev
```

## 📊 Data Flow

1. **Sensing Layer**
   - BMP280 sensor readings (temperature, pressure)
   - I2C communication protocol
   - Data sampling rates: 1s/60s configurable

2. **Processing Layer**
   - JSON formatting
   - Outlier filtering
   - Error handling

3. **Communication Layer**
   - MQTT protocol (QoS 2)
   - SSL/TLS encryption
   - Automatic reconnection

4. **Storage Layer**
   - InfluxDB time-series database
   - Data retention policies
   - Query optimization

## 🚀 Usage

### Initial Setup
1. Power up the Pico W
2. Connect to Wi-Fi:
   - Device will attempt to connect to configured network
   - If failed, connects to "Pico_Wifi_AP" with password "123456789"
   - Configure new Wi-Fi credentials through web interface

### Monitoring
- Access web dashboard: `http://your-deployed-url`
- View Grafana dashboards: `http://localhost:3000`

### Data Collection Modes
1. Frequent Small Payload:
   - 1-second intervals
   - Real-time monitoring
   - Higher network usage

2. Infrequent Small Payload:
   - 60-second intervals
   - Reduced network traffic
   - Power-efficient

## 📈 Performance Metrics

- Data sampling rate: 1s/60s
- Network latency: ~0.02s average
- Temperature range: -40°C to 85°C
- Pressure range: 300hPa to 1100hPa

## 🛡️ Security Features

- SSL/TLS encryption for MQTT
- Authentication tokens
- HTTPS for web interfaces
- Secure WebSocket (WSS)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [MicroPython](https://micropython.org/)
- [HiveMQ](https://www.hivemq.com/)
- [InfluxDB](https://www.influxdata.com/)
- [Next.js](https://nextjs.org/)
- [Grafana](https://grafana.com/)

## 🔗 References

- [BMP280 Datasheet](https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bmp280-ds001.pdf)
- [MicroPython Documentation](https://docs.micropython.org/)
- [MQTT Protocol](https://mqtt.org/)

## 📧 Contact

For questions or support, please open an issue in the repository.
