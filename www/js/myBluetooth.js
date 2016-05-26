window.onload = function(){
    document.addEventListener('deviceready', function () {
        new Promise(function (resolve, reject) {
            bluetoothle.initialize(resolve, reject,
                { request: true, statusReceiver: false });
        }).then(initializeSuccess, handleError);
    });
        
    document.getElementById('name').innerHTML = "arerheh";
    
    function initializeSuccess(result) {
        if (result.status === "enabled") {
            log("Bluetooth is enabled.");
            log(result);
        }
        else {
            document.getElementById("start-scan").disabled = true;    
            log("Bluetooth is not enabled:", "status");
            log(result, "status");
        }
    }
    
    function handleError(error) {
        var msg;
        if (error.error && error.message) {
            var errorItems = [];
            if (error.service) {
                errorItems.push("service: " + (uuids[error.service] || error.service));
            }
            if (error.characteristic) {
                errorItems.push("characteristic: " + (uuids[error.characteristic] || error.characteristic));
            }
            msg = "Error on " + error.error + ": " + error.message + (errorItems.length && (" (" + errorItems.join(", ") + ")"));
        }
        else {
        msg = error;
        }
        log(msg, "error");
        if (error.error === "read" && error.service && error.characteristic) {
            reportValue(error.service, error.characteristic, "Error: " + error.message);
        }
    }
    
    function log(msg, level) {
        level = level || "log";
        if (typeof msg === "object") {
            msg = JSON.stringify(msg, null, "  ");
        }
        console.log(msg);
        if (level === "status" || level === "error") {
            var msgDiv = document.createElement("div");
            msgDiv.textContent = msg;
            if (level === "error") {
                msgDiv.style.color = "red";
            }
            msgDiv.style.padding = "5px 0";
            msgDiv.style.borderBottom = "rgb(192,192,192) solid 1px";
            document.getElementById("output").appendChild(msgDiv);
        }
    }
}
var foundDevices = [];

function startScan() {
    log("Starting scan for devices...", "status");
    foundDevices = [];
    document.getElementById("uuid").innerHTML = "";
    document.getElementById("name").innerHTML = "";
    document.getElementById("rssi").innerHTML = "";
    if (window.cordova.platformId === "android" || window.cordova.platformId === "browser") {
        bluetoothle.retrieveConnected(retrieveConnectedSuccess, handleError, {});
    }
    else {
        bluetoothle.startScan(startScanSuccess, handleError, { services: [] });
    }
}

function startScanSuccess(result) {
    log("startScanSuccess(" + result.status + ")");
    if (result.status === "scanStarted") {
        log("Scanning for devices (will continue to scan until you select a device)...", "status");
    }
    else if (result.status === "scanResult") {
        if (!foundDevices.some(function (device) {
            return device.address === result.address;
        })) {
            log('FOUND DEVICE:');
            log(result);
            foundDevices.push(result);
            addDevice(result.name, result.address);
        }
    }
}
