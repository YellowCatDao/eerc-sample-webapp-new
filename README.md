# EERC Token Web Application

A modern React-based web application for interacting with Encrypted ERC20 (EERC) tokens on the Avalanche blockchain.
This application provides a complete interface for private token operations using zero-knowledge proofs.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

## ✨ Features

- **🔐 Wallet Integration**: Connect any Ethereum-compatible wallet using ConnectKit
- **👤 User Registration**: Register for EERC operations with zero-knowledge proof generation
- **🔑 Key Management**: Generate and manage decryption keys for private balance viewing
- **💰 Token Operations**:
    - **Deposit**: Convert regular ERC20 tokens to encrypted tokens
    - **Withdraw**: Convert encrypted tokens back to regular ERC20 tokens
    - **Transfer**: Send encrypted tokens privately to other users
- **📊 Balance Management**: View encrypted balances with decryption capabilities
- **🔍 Debug Panel**: Comprehensive debugging information for developers
- **🌐 Multi-Network**: Support for both Avalanche Mainnet and Fuji Testnet

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18 or higher
- **npm** or **pnpm** (pnpm recommended for faster installs)
- **MetaMask** or another Web3 wallet

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd eerc-sample-webapp
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. **Open your browser**

   Navigate to [http://localhost:5173](http://localhost:5173)

## 🛠️ Available Scripts

| Command        | Description              |
|----------------|--------------------------|
| `pnpm dev`     | Start development server |
| `pnpm build`   | Build for production     |
| `pnpm preview` | Preview production build |
| `pnpm lint`    | Run Biome linter         |
| `pnpm format`  | Format code with Biome   |

## ⚙️ Configuration

### Contract Addresses

Contract addresses are configured in `src/constants/contracts.ts`:

```typescript
// Mainnet contracts
export const MAINNET_EERC_ADDRESS = "0x8C6aE98Db339fb884cF81f64FC6d18a23589Ad56";
export const MAINNET_REGISTRAR_ADDRESS = "0x06622994B42d6D98fbEe08AaBB368f8064DD593e";
export const MAINNET_TOKEN_ADDRESS = "0xFFFF003a6BAD9b743d658048742935fFFE2b6ED7";

// Testnet contracts (Fuji)
export const TESTNET_EERC_ADDRESS = "0x8C6aE98Db339fb884cF81f64FC6d18a23589Ad56";
export const TESTNET_REGISTRAR_ADDRESS = "0x06622994B42d6D98fbEe08AaBB368f8064DD593e";
export const TESTNET_TOKEN_ADDRESS = "0xFFFF003a6BAD9b743d658048742935fFFE2b6ED7";
```

### Zero-Knowledge Proof Files

ZK circuit files are configured in `src/config/zkFiles.ts` and hosted on CloudFront:

- **Base URL**: `https://d30f1urb9i1c13.cloudfront.net/zk_files/`
- **Circuits**: Registration, Transfer, Mint, Withdraw, Burn

### WalletConnect Configuration

The WalletConnect project ID is configured in `src/context/WagmiContext.tsx`. Replace with your own project ID
from [WalletConnect Cloud](https://cloud.walletconnect.com/).

## 📱 Usage Guide

### 1. Connect Wallet

- Click "Connect Wallet" in the header
- Choose your preferred wallet (MetaMask, WalletConnect, etc.)
- Ensure you're connected to Avalanche Mainnet or Fuji Testnet

### 2. Register for EERC

- Click "Register" to join the EERC system
- This creates your cryptographic keys for private operations
- Registration is required before any other operations

### 3. Generate Decryption Key

- Click "Generate Decryption Key" to create keys for viewing encrypted balances
- This is separate from registration and specifically for balance decryption

### 4. Token Operations

#### Deposit (Wrap)

- Enter the amount of regular tokens to convert
- Click "Deposit" to convert them to encrypted tokens
- Requires prior token approval

#### Withdraw (Unwrap)

- Enter the amount of encrypted tokens to convert back
- Click "Withdraw" to receive regular tokens

#### Transfer

- Enter recipient address and amount
- Click "Transfer" to send encrypted tokens privately
- Recipient must be registered in the EERC system

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS
- **Blockchain**: Wagmi + Viem for Ethereum interactions
- **Wallet**: ConnectKit for wallet connections
- **Linting**: Biome for code quality
- **ZK Proofs**: EERC SDK with WebAssembly circuits

### Project Structure

```
src/
├── components/          # React components
│   ├── DebugPanel.tsx   # Developer debugging information
│   ├── Header.tsx       # Application header with wallet connection
│   ├── NetworkToggle.tsx # Network switching component
│   ├── Register.tsx     # User registration for EERC
│   ├── TokenOperations.tsx # Deposit/withdraw operations
│   └── TokenTransfer.tsx # Private token transfers
├── config/
│   └── zkFiles.ts       # Zero-knowledge circuit configuration
├── constants/
│   └── contracts.ts     # Smart contract addresses
├── context/
│   ├── EERCContext.tsx  # EERC state management
│   └── WagmiContext.tsx # Wagmi/Web3 configuration
├── lib/
│   ├── batchReadCalls.ts # Optimized contract reading
│   ├── utils.ts         # Utility functions
│   └── wagmiConfig.ts   # Wagmi hook configurations
└── main.tsx            # Application entry point
```

## 🔧 Development

### Code Style

This project uses **Biome** for linting and formatting with the following configuration:

- **Indentation**: 2 spaces
- **Line width**: 120 characters
- **Quotes**: Single quotes for JS/TS, double quotes for JSX
- **Semicolons**: Required

## 📚 Learn More

### EERC Documentation

- [EERC SDK Overview](https://avacloud.gitbook.io/encrypted-erc/usage/sdk-overview)
- [useEERC Hook Documentation](https://avacloud.gitbook.io/encrypted-erc/usage/useeerc)
- [useEncryptedBalance Hook](https://avacloud.gitbook.io/encrypted-erc/usage/useencryptedbalance)
