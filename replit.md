# SMS Bot - Discord Bot for SMS Number Sales

## Overview

This is a Discord bot built with Discord.js v14 for selling SMS verification numbers through the SMS24H API. The bot provides a complete ticket-based sales system with automated payments via Mercado Pago (Brazilian payment processor) and manual PIX payments.

**Core Features:**
- Ticket-based purchase flow with 5 stages (terms → menu → catalog → confirmation → delivery)
- Integration with SMS24H API for virtual phone numbers
- Payment processing via Mercado Pago (automatic) or manual PIX
- Admin panel for configuration and user management
- 140+ SMS services available (WhatsApp, Telegram, Instagram, etc.)
- 15% profit margin on all services

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Application Structure
```
├── index.js                    # Main entry point, Discord client setup
├── config.json                 # Bot token and core settings
├── ComandosSlash/              # Slash commands
│   ├── Administracao/          # Admin commands (/painel)
│   ├── ComandosAdm/            # Staff commands (saldo, config, etc.)
│   └── Usuarios/               # User commands (/menu)
├── Eventos/                    # Event handlers
│   ├── SistemaDeHandlers/      # Main handlers (ticketHandler, menuPrincipal)
│   ├── Sistema de Compra/      # Purchase system events
│   └── Sistema de Config/      # Configuration events
├── Handler/                    # Core modules
│   ├── sms24h.js              # SMS24H API integration
│   ├── mercadopago.js         # Payment processing
│   └── emojis.js              # Emoji constants
├── DataBaseJson/              # JSON-based database (wio.db)
└── Functions/                 # Utility functions
```

### Database Design
Uses wio.db (JSON-based database) with the following stores:
- `config.json` - Bot settings, channel IDs, API keys
- `saldo.json` - User balances
- `perms.json` - Admin permissions
- `produto.json` - Product catalog
- `tema.json` - Visual customization

### Ticket Flow (5 Stages)
1. **Terms Acceptance** - User accepts usage terms
2. **Main Menu** - Dashboard with balance and options
3. **Service Catalog** - Paginated list (5 items/page) of SMS services
4. **Purchase Confirmation** - Balance verification and confirmation
5. **Delivery** - SMS24H API call, number delivery, SMS monitoring

### Key Design Decisions
- **Anti-duplication System**: Prevents users from opening multiple tickets using both memory Map and database persistence
- **Navigation**: Uses `interaction.update()` for fluid navigation without message spam
- **Payment Flexibility**: Supports both automatic (Mercado Pago) and manual (PIX) payment methods
- **Service Pricing**: 15% margin applied automatically to base prices from SMS24H

## External Dependencies

### NPM Packages
- `discord.js` ^14.14.1 - Discord API wrapper
- `axios` ^1.6.7 - HTTP client for API calls
- `mercadopago` ^2.0.8 - Mercado Pago SDK for payments
- `wio.db` ^4.0.22 - JSON-based database
- `moment` ^2.30.1 - Date/time handling
- `@discordjs/voice` ^0.16.1 - Voice support (optional)

### External APIs
- **SMS24H API** (`https://api.sms24h.org/stubs/handler_api`)
  - Actions: getNumber, getBalance, getStatus, setStatus
  - Country default: 73 (Brazil)
  - Requires API key configuration

- **Mercado Pago API**
  - Used for automatic PIX payment generation
  - Requires access_token configuration
  - Webhook support for payment confirmation

### Configuration Required
- Discord bot token in `config.json`
- SMS24H API key via admin panel
- Mercado Pago access token (optional, for auto payments)
- PIX key for manual payments (optional)
- Ticket category and log channel IDs