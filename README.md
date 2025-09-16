# VpnHood! WebUI

This repository contains the source code for the VpnHood! WebUI, built with **Vue 3** and **Vite**.

---

## 🚀 Getting Started

To get the project up and running, follow these steps.

### 📋 Prerequisites

You'll need **Node.js (v16+)** installed on your system. You can download it from the official [Node.js website](https://nodejs.org/).

### 📥 Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/vpnhood/VpnHood.Client.WebUI.git
    ```
2.  **Install dependencies:**
    ```sh
    npm install
    ```

### ⚙️ Configuration

The WebUI needs to know where to find the VpnHood API. The **`.env.development`** file already exists in the project.
Open it and configure the `VITE_API_BASE_URL` to match your environment.

| Environment | VpnHood! Client | VpnHood! Connect |
| :--- | :--- | :--- |
| **Windows** | `VITE_API_BASE_URL=http://my-vpnhood:9571` | `VITE_API_BASE_URL=http://my-vpnhood-connect:9571` |
| **Android** | `VITE_API_BASE_URL=http://<YOUR_DEVICE-IP>:9581` | `VITE_API_BASE_URL=http://<YOUR_DEVICE-IP>:9571` |

> 💡 **Note:** Replace `<YOUR_DEVICE-IP>` with the actual IP address of the device running the VpnHood app.

---

## 🛠 Development & Building

### 💻 Local Development

To start a development server with **hot-reloading**:

```sh
npm run dev
```
### or
```sh
vite serve
```

## 🏗️ Production Build
To build a production-ready version:
```sh
npm run build
```
### or
```sh
vite build
```
This command generates the compiled files in the dist directory.

## 📦 Packaging

After building the project, you'll need to package the output for use with the VpnHood app.
1. Navigate to the `dist` directory.
2. Compress the contents of the `dist` directory (not the folder itself) into a zip file named `SPA.zip`.
3. Copy `SPA.zip` to the target project directory.
