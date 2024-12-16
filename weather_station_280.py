import time
import network
import machine
import ujson
import socket
from libs.simple import MQTTClient
import urequests
from libs.bmp280_i2c import BMP280I2C
from libs.bmp280_configuration import BMP280Configuration
from config import *

# Constants for Wi-Fi and MQTT
# SSID = "Cudy-0948"
# PASSWORD = "mashfik12345"
AP_SSID = "Pico_Wifi_AP"  # AP name
AP_PASSWORD = "123456789"  # AP password (change as needed)
API_URL = "http://example.com/api/weather"
BROKER_ADDRESS = "192.168.10.117"  # MQTT Broker Address
BROKER_PORT = 1883
BROKER_USERNAME = "username"  # Remove if not used
BROKER_PASSWORD = "helloworld"  # Remove if not used
MQTT_TOPIC = "sensor/data"  # Topic for sensor data

# I2C Configuration
I2C_SCL_PIN = 5
I2C_SDA_PIN = 4
I2C_ADDRESS = 0x76  # BMP280 I2C address (0x76 or 0x77)

# Initialize I2C and MQTT Client
i2c = machine.I2C(0, scl=machine.Pin(I2C_SCL_PIN), sda=machine.Pin(I2C_SDA_PIN))
sensor = BMP280I2C(address=I2C_ADDRESS, i2c=i2c, configuration=BMP280Configuration())

# Function for logging with timestamp
def log(level, message):
    timestamp = time.localtime()  # Get current time
    timestamp_str = "{:04d}-{:02d}-{:02d} {:02d}:{:02d}:{:02d}".format(*timestamp[:6])
    print(f"[{timestamp_str}] {level}: {message}")

# Function to connect to Wi-Fi
def connect_wifi(ssid, password):
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(ssid, password)
    retry_count = 0
    while not wlan.isconnected() and retry_count < 5:
        log("INFO", f"Attempting to connect to Wi-Fi: {ssid}...")
        time.sleep(1)
        retry_count += 1
    if wlan.isconnected():
        log("INFO", f"Connected to Wi-Fi: {wlan.ifconfig()}")
        return True
    else:
        log("ERROR", f"Failed to connect to Wi-Fi {ssid}.")
        return False

# Create an Access Point (AP) mode
def create_ap():
    try:
        ap = network.WLAN(network.AP_IF)
        ap.active(True)
        ap.config(essid=AP_SSID, password=AP_PASSWORD)  # WPA2-PSK security
        log("INFO", f"Access Point created with SSID: {AP_SSID}, password: {AP_PASSWORD}")
        
        # Wait for the AP mode to become active
        time.sleep(2)  # Allow a brief delay for the AP to be fully initialized
        
        # Check if the AP is active
        if ap.active():
            log("INFO", f"AP is active. IP configuration: {ap.ifconfig()}")
        else:
            log("ERROR", "Failed to activate the Access Point")
        
    except Exception as e:
        log("ERROR", f"Exception in create_ap: {e}")

# Function to serve a simple HTML form to input new Wi-Fi credentials
def serve_web():
    try:
        addr = socket.getaddrinfo('0.0.0.0', 80)[0][-1]
        s = socket.socket()
        s.bind(addr)
        s.listen(1)
        log("INFO", f"Listening on {addr}")
        while True:
            cl, addr = s.accept()
            log("INFO", f"Client connected from {addr}")
            request = cl.recv(1024)
            request_str = str(request)

            if 'POST' in request_str:
                ssid_start = request_str.find("ssid=") + 5
                ssid_end = request_str.find("&", ssid_start)
                password_start = request_str.find("password=") + 9
                password_end = request_str.find(" HTTP", password_start)

                ssid = request_str[ssid_start:ssid_end]
                password = request_str[password_start:password_end]

                log("INFO", f"Received SSID: {ssid}, Password: {password}")

                # Try connecting to the new Wi-Fi network
                if connect_wifi(ssid, password):
                    cl.send('HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n')
                    cl.send('<html><body><h2>Wi-Fi Connected Successfully!</h2></body></html>')
                else:
                    cl.send('HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n')
                    cl.send('<html><body><h2>Failed to connect to Wi-Fi. Try again.</h2></body></html>')
                cl.close()
                break
    except Exception as e:
        log("ERROR", f"Exception in serve_web: {e}")

# Function to process and get sensor data
def process_data(sensor):
    try:
        # Get sensor measurements (temperature and pressure)
        measurements = sensor.measurements
        temperature = round(measurements['t'], 2)  # Temperature in Celsius
        pressure = round(measurements['p'], 2)  # Pressure in hPa

        # Log the sensor readings
        log("INFO", f"Temperature: {temperature}°C, Pressure: {pressure} hPa")

        # Return structured data for MQTT and API
        return {
            "temperature": temperature,
            "pressure": pressure
        }
    except Exception as e:
        log("ERROR", f"Error while processing sensor data: {e}")
        return None

# MQTT Publish with error handling
def send_mqtt(client, topic, data):
    try:
        payload = ujson.dumps(data)  # Convert data to JSON using ujson
        log("INFO", f"Publishing to MQTT: {payload}")
        client.publish(topic, payload)
        log("INFO", f"Data sent to MQTT: {payload}")
    except Exception as e:
        log("ERROR", f"Failed to send data via MQTT: {e}")
        reconnect_mqtt(client)

# Reconnect MQTT client if necessary
def reconnect_mqtt(client):
    try:
        log("INFO", "Attempting to reconnect to MQTT broker...")
        client.connect()
        log("INFO", "Reconnected to MQTT broker")
    except Exception as e:
        log("ERROR", f"Reconnection failed: {e}")
        time.sleep(5)  # Retry after 5 seconds
        reconnect_mqtt(client)

# Function to establish MQTT connection
def connect_mqtt():
    client = None
    retry_count = 0
    while client is None and retry_count < 5:
        try:
            client = MQTTClient(client_id="pico", server=BROKER_ADDRESS, port=BROKER_PORT, user=BROKER_USERNAME, password=BROKER_PASSWORD)
            client.connect()
            log("INFO", "Connected to MQTT broker")
        except Exception as e:
            log("ERROR", f"MQTT connection failed: {e}")
            retry_count += 1
            time.sleep(5)
    if client is None:
        log("CRITICAL", "Failed to connect to MQTT broker after 5 attempts")
        raise ConnectionError("Failed to connect to MQTT broker")
    return client

# Main function
def main():
    try:
        if not connect_wifi(SSID, PASSWORD):
            log("INFO", "Failed to connect to the known Wi-Fi. Starting Access Point...")
            create_ap()  # If you want AP mode when Wi-Fi fails, implement create_ap()
            serve_web()  # Serve a web page to input new credentials
        else:
            log("INFO", "Wi-Fi connected successfully, proceeding with MQTT connection.")
            mqtt_client = connect_mqtt()

            # Loop to continuously send sensor data via MQTT
            while True:
                data = process_data(sensor)
                if data:
                    send_mqtt(mqtt_client, MQTT_TOPIC, data)
                time.sleep(1)  # Send data every minute
    except Exception as e:
        log("CRITICAL", f"Critical error occurred: {e}")
        machine.reset()  # Reset the device to restart the program

# Run the main program
if __name__ == "__main__":
    main()

