#### **Weather Station Setup**

This project reads data from a BME680 sensor using a Raspberry Pi Pico W, processes the data, and publishes it to an MQTT broker and an HTTP API.

#### **Prerequisites**

*   Raspberry Pi Pico W
    
*   BME680 Sensor
    
*   MQTT Broker (Running on localhost)
    
*   HTTP API endpoint
    

#### **Installation**

1.  Copy the weather\_station.py file to your Raspberry Pi Pico W.
    
2.  Install the required MicroPython libraries:
    
    *   umqtt.simple
        
    *   urequests
        
    *   bme680
        

#### **Configuration**

*   Adjust I2C\_SCL\_PIN and I2C\_SDA\_PIN in the code to match your hardware setup.
    
*   Update API\_URL to point to your HTTP API.
    

#### **Execution**

1.  Upload the script to the Pico W.
    
2.  Run the script using your MicroPython environment.
    
3.  Observe the MQTT messages and API responses in the console.
    

#### **Notes**

*   Ensure your MQTT broker is running and accessible.
    
*   Modify the processing function as needed for additional data validation or normalization.