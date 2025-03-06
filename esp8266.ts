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
     * Send data to ThinkSpeak
     */
    //% block="Send Data to your ThinkSpeak Channel|Write API Key %apiKey|Field1 %field1|Field2 %field2|Field3 %field3|Field4 %field4|Field5 %field5|Field6 %field6|Field7 %field7|Field8 %field8"
    //% block.loc.de="Sende Daten an deinen ThinkSpeak Kanal|Write API Key %apiKey|Feld 1 %field1||Feld 2 %field2|Feld 3 %field3|Feld 4 %field4|Feld 5 %field5|Feld 6 %field6|Feld 7 %field7|Feld 8 %field8"
    //% expandableArgumentMode="enabled"
    //% apiKey.defl="your Write API Key"
    export function sendToThinkSpeak(apiKey: string, field1: number=0, field2: number=0, field3: number=0, field4: number=0, field5: number=0, field6: number=0, field7: number=0, field8: number=0) {
        let result = 0
        let retry = 2

        // close the previous TCP connection
        if (isWifiConnected) {
            sendAtCmd("AT+CIPCLOSE")
            waitAtResponse("OK", "ERROR", "None", 2000)
        }

        while (isWifiConnected && retry > 0) {
            retry = retry - 1;
            // establish TCP connection
            sendAtCmd("AT+CIPSTART=\"TCP\",\"api.thingspeak.com\",80")
            result = waitAtResponse("OK", "ALREADY CONNECTED", "ERROR", 2000)
            if (result == 3) continue

            let data = "GET /update?api_key=" + apiKey
            if (!isNaN(field1)) data = data + "&field1=" + field1
            if (!isNaN(field2)) data = data + "&field2=" + field2
            if (!isNaN(field3)) data = data + "&field3=" + field3
            if (!isNaN(field4)) data = data + "&field4=" + field4
            if (!isNaN(field5)) data = data + "&field5=" + field5
            if (!isNaN(field6)) data = data + "&field6=" + field6
            if (!isNaN(field7)) data = data + "&field7=" + field7
            if (!isNaN(field8)) data = data + "&field8=" + field8

            sendAtCmd("AT+CIPSEND=" + (data.length + 2))
            result = waitAtResponse(">", "OK", "ERROR", 2000)
            if (result == 3) continue
            sendAtCmd(data)
            result = waitAtResponse("SEND OK", "SEND FAIL", "ERROR", 5000)

            // // close the TCP connection
            // sendAtCmd("AT+CIPCLOSE")
            // waitAtResponse("OK", "ERROR", "None", 2000)

            if (result == 1) break
        }
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
        let splitData = data.split(`"field${field}":"`);
        if (splitData.length > 1) {
              let valueString = splitData[1].split(`"`)[0];
              let value = parseFloat(valueString);
        } else {
              let value = NaN;
        }

        
        sendAtCmd("AT+CIPCLOSE")
        waitAtResponse("OK", "ERROR", "None", 2000)
        return value
    }
} 
