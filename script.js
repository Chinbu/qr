document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('btn-generate-qr').addEventListener('click', function() {
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('qr-generation-screen').classList.remove('hidden');
    });

    document.querySelectorAll('.back-to-menu').forEach(button => {
        button.addEventListener('click', function() {
            document.getElementById('qr-generation-screen').classList.add('hidden');
            document.getElementById('qr-scanning-screen').classList.add('hidden');
            document.getElementById('main-menu').classList.remove('hidden');
        });
    });

    document.getElementById('generate-qr').addEventListener('click', function() {
        var qrText = document.getElementById('qr-text').value;
        if (!qrText) {
            alert('Please enter some text to generate QR Code.');
            return;
        }
        var qrContainer = document.getElementById('qr-code');
        qrContainer.innerHTML = ''; // Clear previous QR code
        new QRCode(qrContainer, {
            text: qrText,
            width: 128,
            height: 128,
        });

        document.getElementById('download-qr').classList.remove('hidden');
        document.getElementById('download-qr').onclick = function() {
            var qrImg = qrContainer.querySelector('img').src;
            var a = document.createElement('a');
            a.href = qrImg;
            a.download = 'QRCode.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
    });

    // Scan QR Code
    document.getElementById('btn-scan-qr').addEventListener('click', startScanning);
});

function startScanning() {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('qr-scanning-screen').classList.remove('hidden');
    
    // Setup the QR code scanner
    const html5QrCode = new Html5Qrcode("qr-reader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    html5QrCode.start({ facingMode: "environment" }, config, (decodedText, decodedResult) => {
        // Process the QR code content
        processQrCodeContent(decodedText);
        
        // Optionally, stop the QR code scanner to prevent continuous scanning
        html5QrCode.stop().then(() => {
            console.log("QR Scanning stopped.");
        }).catch(err => {
            console.error("Unable to stop QR scanning.", err);
        });
    }).catch(err => {
        console.log("Unable to start QR scanning", err);
    });
}

function processQrCodeContent(decodedText) {
    if(decodedText.startsWith("WIFI:")) {
        handleWifiQrCode(decodedText);
    } else if(decodedText.startsWith("http://") || decodedText.startsWith("https://")) {
        handleWebsiteQrCode(decodedText);
    } else {
        handleGenericQrCode(decodedText);
    }
}

function handleWifiQrCode(decodedText) {
    let ssid = decodedText.match(/S:(.*?);/)?.[1];
    let password = decodedText.match(/P:(.*?);/)?.[1];
    document.getElementById('qr-result').innerHTML = `WiFi SSID: ${ssid}<br>Password: ${password}<br><button onclick="copyText('SSID: ${ssid}, Password: ${password}')">Copy Details</button>`;
}

function handleWebsiteQrCode(decodedText) {
    document.getElementById('qr-result').innerHTML = `Website URL: <a href="${decodedText}" target="_blank">${decodedText}</a><br><button onclick="copyText('${decodedText}')">Copy URL</button>`;
}

function handleGenericQrCode(decodedText) {
    document.getElementById('qr-result').innerHTML = `Scanned Text: ${decodedText}<br><button onclick="copyText('${decodedText}')">Copy Text</button>`;
}

function copyText(textToCopy) {
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert('Copied to clipboard');
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy text');
    });
}
document.getElementById('btn-upload-qr').addEventListener('click', function() {
    const fileInput = document.getElementById('qr-file');
    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        // Initialize the QR code scanner
        const html5QrCode = new Html5Qrcode("qr-reader");
        
        html5QrCode.scanFile(file, /* showImage= */ true).then(decodedText => {
            // Handle the decoded text
            processQrCodeContent(decodedText);
        }).catch(err => {
            // Handle the error if the QR code could not be decoded
            console.error("Error scanning file.", err);
            document.getElementById('qr-result').innerText = "Could not decode QR code.";
        }).finally(() => {
            // Cleanup or reset if necessary
            html5QrCode.stop().catch(err => {
                console.error("Error stopping the QR scanner.", err);
            });
        });
    } else {
        alert('Please select a file to upload.');
    }
});
downloadQrBtn.addEventListener('click', function() {
    const qrCanvas = document.querySelector('#qrcode canvas');
    // For non-IE
    if (window.navigator && window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(qrCanvas.msToBlob(), 'QRCode.png');
    } else {
        const imageURL = qrCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        let downloadLink = document.createElement('a');
        downloadLink.href = imageURL;

        // Setting download name
        downloadLink.download = 'QRCode.png';

        // Triggering the download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
});
function handleWebsiteQrCode(decodedText) {
    // Creating a "Go to Website" button dynamically
    let goToWebsiteBtn = document.createElement("button");
    goToWebsiteBtn.textContent = "Go to Website";
    goToWebsiteBtn.onclick = function() {
        window.location.href = decodedText; // Redirect to the URL
    };
    goToWebsiteBtn.style.marginTop = "10px";

    // Clear previous results
    let qrResultContainer = document.getElementById('qr-result');
    qrResultContainer.innerHTML = '';

    // Adding the "Go to Website" button to the qr-result container
    qrResultContainer.appendChild(goToWebsiteBtn);
}
function handleWifiQrCode(decodedText) {
    // Extracting SSID and Password from the WiFi QR Code
    let ssidMatch = decodedText.match(/S:(.*?);/);
    let passwordMatch = decodedText.match(/P:(.*?);/);
    let ssid = ssidMatch ? ssidMatch[1] : "N/A";
    let password = passwordMatch ? passwordMatch[1] : "N/A";

    // Display WiFi Password with a Copy Button
    let qrResultContainer = document.getElementById('qr-result');
    qrResultContainer.innerHTML = `<p>WiFi SSID: ${ssid}</p><p>Password: ${password}</p><button id="copy-password-btn">Copy Password</button>`;

    // Adding Click Event Listener to the "Copy Password" Button
    let copyPasswordBtn = document.getElementById("copy-password-btn");
    copyPasswordBtn.addEventListener('click', function() {
        // Using the Clipboard API to copy the password
        navigator.clipboard.writeText(password).then(() => {
            alert('Password copied to clipboard.');
        }).catch(err => {
            console.error('Failed to copy password: ', err);
            alert('Failed to copy password.');
        });
    });
}
function showInterstitialAd() {
    var interstitial = new google.ads.interstitial.InterstitialAd();
    interstitial.load({
        adUnitId: 'ca-app-pub-9151182030817748/5296099603'
    }).then(() => interstitial.show()).catch(e => console.error('Interstitial ad failed to load/show:', e));
}

// Example usage: calling this function when the back button is pressed.
document.getElementById('back-button').addEventListener('click', showInterstitialAd);
function checkNetworkAndLoadAds() {
    if (navigator.onLine) {
        (adsbygoogle = window.adsbygoogle || []).push({});
        startApp.init();
    } else {
        console.log("No network: Ads won't load");
    }
}

window.addEventListener('online',  checkNetworkAndLoadAds);
window.addEventListener('offline', function() {
    console.log("You are offline");
});

// Initially check once on page load
checkNetworkAndLoadAds();
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000); // Hide notification after 3 seconds
}

function generateQRCode() {
    if (!navigator.onLine) {
        showNotification('Network error. Please check your connection to generate QR Code.');
        return;
    }
    // Assuming you have some function to generate QR code
    console.log("Generating QR Code...");
    // generateQRCodeHere();
}

function downloadQRCode() {
    if (!navigator.onLine) {
        showNotification('Network error. Please check your connection to download QR Code.');
        return;
    }
    // Assuming you have some function to download QR code
    console.log("Downloading QR Code...");
    // downloadQRCodeHere();
}

// Optional: Listen for online/offline status changes
window.addEventListener('online', () => showNotification('You are online.'));
window.addEventListener('offline', () => showNotification('You are offline.'));
