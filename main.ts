namespace esp8266 {
    // wir klinken uns frech in das ESP8266-Paket ein!

    // Originalcode:
    // https://github.com/alankrantas/pxt-ESP8266_ThingSpeak
    // MIT License Copyright (c) 2019 Alan Wang & Michael Klein
    // geändert für Calliope V0-Core 14.10.19

    let wifi_connected: boolean = false
    let thingspeak_connected: boolean = false
    let last_upload_successful: boolean = false

    // write AT command with CR+LF ending
    function sendAT(command: string, wait: number = 100) {
        serial.writeString(command + "\u000D\u000A")
        basic.pause(wait)
    }

    /**
    * Connect to ThingSpeak and upload data. It would not upload anything if it failed to connect to Wifi or ThingSpeak.
    */
    //% block="Upload data to ThingSpeak|URL/IP = %ip|Write API key = %write_api_key|Field 1 = %n1|Field 2 = %n2|Field 3 = %n3|Field 4 = %n4|Field 5 = %n5|Field 6 = %n6|Field 7 = %n7|Field 8 = %n8"
    //% ip.defl=api.thingspeak.com
    //% write_api_key.defl=your_write_api_key
    //% blockId=connectThingSpeak
    //% weight=208

    export function connectThingSpeak(ip: string, write_api_key: string, n1: number, n2: number, n3: number, n4: number, n5: number, n6: number, n7: number, n8: number) {
        if (esp8266.isAttached() && write_api_key != "") {
            //thingspeak_connected = false
            sendAT("AT+CIPSTART=\"TCP\",\"" + ip + "\",80", 0) // connect to website server
            thingspeak_connected = true//waitResponse()
            basic.pause(1000) //100
            if (thingspeak_connected) {
                //last_upload_successful = false
                let str: string = "GET /update?api_key=" + write_api_key + "&field1=" + n1 + "&field2=" + n2 + "&field3=" + n3 + "&field4=" + n4 + "&field5=" + n5 + "&field6=" + n6 + "&field7=" + n7 + "&field8=" + n8
                sendAT("AT+CIPSEND=" + (str.length + 2))
                sendAT(str, 0) // upload data
                //last_upload_successful = true//waitResponse()
                basic.pause(100)
            }
        }
    }

    /**
    * Wait between 2 uploads
    */
    //% block="Wait between ThingSpeak uploads %delay ms"
    //% delay.min=0 delay.defl=5000
    //% blockId=wait
    //% weight=208
    export function wait(delay: number) {
        if (delay > 0) basic.pause(delay)
    }
}