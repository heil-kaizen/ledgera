# Ledgera

A public transparency layer for crypto-powered charity funding. Ledgera was founded to solve the "Last Mile" problem in the Solana ecosystem by adding manual accountability and verifiable on-chain proof to crypto donations.

## About The Project

While the crypto and memecoin communities have an incredible capacity for generosity, that impact is often lost in a "Black Box" of automated routing and invisible distribution. Ledgera serves as a public transparency layer that turns on-chain donations into real-world relief. We don't hide behind automated claims. We manually verify every charity, manage secure donation endpoints, and provide public proof for every dollar distributed. In an ecosystem defined by speed and anonymity, Ledgera provides the missing layer of accountability. We don't just route funds; we ledger impact. Our platform bridges the gap between high-speed memecoin innovation and verified traditional relief, ensuring every transaction is a matter of public record.

## How It Works

1. **Rigorous Vetting & Application**
   Every project begins with a human review. Charities or coin creators apply to be listed. Our admins manually verify the legitimacy of the organization, their mission, and their preferred method of receiving funds.

2. **Transparent Routing**
   Once approved, a dedicated Solana wallet is assigned to the charity and displayed publicly on our dashboard. Creators can direct their network fees or community donations to this verified address, ensuring funds are segregated and tracked from Day 1.

3. **Verified Distribution**
   When funds are ready to be distributed, we handle the conversion and off-ramping. Within 24-48 hours of a payout, we upload the Solana Transaction Hash and a digital receipt to our transparency portal.

## Tech Stack

* **Frontend:** React 18, TypeScript, Vite
* **Styling:** Tailwind CSS
* **Database:** Supabase (PostgreSQL)
* **Icons:** Lucide React
* **Animations:** Motion

## Getting Started

### Prerequisites

* Node.js
* npm
* A Supabase project

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
   
   Required variables:
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`

3. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

* `src/components`: UI components including BentoGrid cards and layout elements.
* `src/pages`: Application views (Home, About, Apply, Transparency, CharityDetail).
* `src/lib`: Utilities and Supabase client configuration.

## Database Schema

The required database schema is located in `supabase_schema.sql`. You can execute this script in your Supabase SQL editor to bootstrap the necessary tables and Row Level Security (RLS) policies.

## Deployment Notes

* The development environment uses a specialized static file server flow configured in `package.json`.
* Do not alter the Vite port configuration (defaults to 3000), as it's required for the hosting proxy architecture.
