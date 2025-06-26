function createOfflineScreen() {
  if (document.getElementById("offline-screen")) return;

  const offlineDiv = document.createElement("div");
  offlineDiv.id = "offline-screen";
  offlineDiv.style.cssText = `
    display: none;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    position: fixed;
    top: 0; left: 0;
    background: rgb(255, 255, 255);
    text-align: center;
    z-index: 99999;
    padding: 2rem;
  `;

  const img = document.createElement("img");
  img.src = "https://i.pinimg.com/originals/55/1d/45/551d452e9eb7377fd4d189bf905a61f3.gif";
  img.alt = "No Internet";
  img.style.cssText = `
    max-width: 280px;
    margin-bottom: 1.5rem;
    animation: float 3s ease-in-out infinite;
  `;

  const h2 = document.createElement("h2");
  h2.textContent = "Oh no~ You're offline!";
  h2.style.cssText = `
    color:rgb(193, 43, 93);
    font-family: 'Comic Neue', cursive;
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
  `;

  const p = document.createElement("p");
  p.textContent = "Please connect to the internet";
  p.style.cssText = `
    font-size: 1.2rem;
    font-family: 'Comic Neue', cursive;
  `;

  offlineDiv.appendChild(img);
  offlineDiv.appendChild(h2);
  offlineDiv.appendChild(p);
  document.body.appendChild(offlineDiv);

  const style = document.createElement("style");
  style.textContent = `
    @keyframes float {
      0% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

function updateConnectionStatus() {
  createOfflineScreen();

  const isOnline = navigator.onLine;
  const offlineScreen = document.getElementById("offline-screen");
  const mainContent = document.getElementById("main-content");

  if (offlineScreen) {
    offlineScreen.style.display = isOnline ? "none" : "flex";
  }
  if (mainContent) {
    mainContent.style.display = isOnline ? "block" : "none";
  }
}

// Listeners
window.addEventListener("load", updateConnectionStatus);
window.addEventListener("online", updateConnectionStatus);
window.addEventListener("offline", updateConnectionStatus);
