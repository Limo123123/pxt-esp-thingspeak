//% weight=2 color=#1174EE icon="\uf1eb" block="ESP8266"

namespace esp8266 {
  let isWifiConnected = false;
    /**
     * Setup Uart WiFi to connect to Wi-Fi
     */
    //% block="Setup Wifi|TX %txPin|RX %rxPin|Baud rate %baudrate|SSID = %ssid|Password = %passwd"
    //% txPin.defl=SerialPin.C17
    //% rxPin.defl=SerialPin.C16
    //% baudRate.defl=BaudRate.BaudRate115200
    export function setupWifi(txPin: SerialPin, rxPin: SerialPin, baudRate: BaudRate, ssid: string, passwd: string) {
        let result = 0

        isWifiConnected = false

        serial.redirect(
            txPin,
            rxPin,
            baudRate
        )

        sendAtCmd("AT")
        result = waitAtResponse("OK", "ERROR", "None", 1000)

        sendAtCmd("AT+CWMODE=1")
        result = waitAtResponse("OK", "ERROR", "None", 1000)

        sendAtCmd(`AT+CWJAP="${ssid}","${passwd}"`)
        result = waitAtResponse("WIFI GOT IP", "ERROR", "None", 20000)

        if (result == 1) {
            isWifiConnected = true
        }
    }

    /**
     * Check if Grove - Uart WiFi V2 is connected to Wifi
     */
    //% block="Wifi OK?"
    export function wifiOK() {
        return isWifiConnected
    }

    /**
     * Retrieve data from ThingSpeak
     */
    //% block="Get Data from ThingSpeak|Read API Key %apiKey|Channel ID %channelID|Field %field"
    export function getFromThinkSpeak(apiKey: string, channelID: string, field: number): number {
        let result = 0
        let data = ""

        if (isWifiConnected) {
            sendAtCmd("AT+CIPCLOSE")
            waitAtResponse("OK", "ERROR", "None", 2000)
        }

        sendAtCmd(`AT+CIPSTART="TCP","api.thingspeak.com",80`)
        result = waitAtResponse("OK", "ALREADY CONNECTED", "ERROR", 2000)
        if (result == 3) return NaN

        let request = `GET /channels/${channelID}/fields/${field}.json?api_key=${apiKey}&results=1`;
        sendAtCmd(`AT+CIPSEND=${request.length + 2}`)
        result = waitAtResponse(">", "OK", "ERROR", 2000)
        if (result == 3) return NaN

        sendAtCmd(request)
        data = serial.readString()
        let value = parseFloat(data.split("field" + field + "\":\"")[1]?.split("\"")[0] || "NaN")
        
        sendAtCmd("AT+CIPCLOSE")
        waitAtResponse("OK", "ERROR", "None", 2000)
        return value
    }
} 
