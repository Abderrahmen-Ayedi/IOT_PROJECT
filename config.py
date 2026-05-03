# config.py — shared configuration for all modules

# MQTT Broker
BROKER_HOST = "localhost"
BROKER_PORT = 1883

# MQTT Topics
TOPIC_CO2 = "factory/sensors/co2"
TOPIC_TEMPERATURE = "factory/sensors/temperature"
TOPIC_GAS = "factory/sensors/gas"
TOPIC_PM10 = "factory/sensors/pm10"
TOPIC_CH4 = "factory/sensors/ch4"
TOPIC_VOCS = "factory/sensors/vocs"
TOPIC_CO = "factory/sensors/co"
TOPIC_HUMIDITY = "factory/sensors/humidity"
TOPIC_WIND_DIR = "factory/sensors/wind_direction"
TOPIC_ALL = "factory/sensors/#"  # wildcard — receives all sensor topics

# Simulation settings
PUBLISH_INTERVAL = 2  # seconds between each publish

# Alert thresholds (Edge layer)
THRESHOLD_CO2 = 800        # ppm
THRESHOLD_TEMPERATURE = 60  # °C
THRESHOLD_GAS = 0.7         # normalized 0-1