# 🧠 Second Brain

> *Your digital brain to capture, connect, and share knowledge effortlessly.*

**Second Brain** is a modern, full-stack knowledge management system that lets you organize and share links, articles, tweets, and videos with ease. Built with a beautiful UI and secure backend, it’s your personal second brain — sharable and searchable.

---

## 📚 Table of Contents

- [✨ Features](#-features)  
- [🏗️ Architecture](#-architecture)  
- [🛠️ Tech Stack](#-tech-stack)  
- [🚀 Getting Started](#-getting-started)  
- [💡 Usage](#-usage)  
- [📁 Folder Structure](#-folder-structure)  
- [🤝 Contributing](#-contributing)  
- [📄 License](#-license)  

---

## ✨ Features

- 🔖 Save & categorize links, articles, tweets, and videos  
- 🏷️ Organize using a powerful tagging system  
- 🔐 Secure authentication using JWT & cookies  
- 📤 Share your knowledge or individual items via links  
- 🧩 Intuitive UI with responsive design  
- 🌐 RESTful API backend powered by Express & MongoDB  

---

## 🏗️ Architecture


- **Frontend**: Built with React (Vite), styled using TailwindCSS and Radix UI components  
- **Backend**: Node.js + Express API with MongoDB, secured with JWT authentication  

---

## 🛠️ Tech Stack

| Layer       | Technologies                               |
|-------------|--------------------------------------------|
| Frontend    | React, Vite, TypeScript, TailwindCSS, Radix UI |
| Backend     | Node.js, Express, TypeScript, Mongoose     |
| Database    | MongoDB                                    |
| Auth        | JWT, Cookies                               |

---

## 🚀 Getting Started

### 🔧 Prerequisites

- Node.js (v18+ recommended)  
- npm or yarn  
- MongoDB (local or remote)  

---

### 📦 Installation

```bash
# Clone the repository
git clone https://github.com/abeer-srivastava/SecondBrain.git
cd second_Brain
Install dependencies:

# Client
cd client-side
npm install

# Server
cd ../server
npm install