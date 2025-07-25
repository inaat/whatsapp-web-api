# WhatsApp API - Node.js Multi-Device

This API is an implementation of [WhiskeySockets Baileys](https://github.com/WhiskeySockets/Baileys) as a RESTful API service that controls WhatsApp functions. This project is based on [whatsapp-api-nodejs](https://github.com/salman0ansari/whatsapp-api-nodejs) and has been updated and improved over time.

With this code, you can create multi-service chats, service bots, or any other system that uses WhatsApp. You don't need to know JavaScript for Node.js - just start the server and make requests in the language you're most comfortable with.

## Features

- ✅ Multi-device support
- ✅ QR Code connection
- ✅ Pairing code connection
- ✅ Send text messages
- ✅ Send media files (audio, video, image, document, gif)
- ✅ Base64 media support
- ✅ Send media from URL
- ✅ Audio/video conversion to WhatsApp format
- ✅ Message replies
- ✅ Typing and recording presence
- ✅ Send location
- ✅ Send contact
- ✅ Send reactions (emoji)
- ✅ Group management (create, join, leave, add/remove participants)
- ✅ Get contacts list
- ✅ Webhook events support
- ✅ Multiple instance support
- ❌ Send buttons (deprecated by WhatsApp)
- ❌ Send templates (deprecated by WhatsApp)

## Installation

### NPM Installation

1. **Download and install Node.js**
   - Visit: https://nodejs.org/en/download

2. **Clone this repository**
   ```bash
   git clone https://github.com/inaat/whatsapp-web-api
   cd whatsapp-web-api
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Configure environment**
   - Rename `.env.example` to `.env`
   - Configure the application port and desired MIME types
   - If you choose to protect routes, you'll need to send the Bearer token in requests:
     ```
     Authorization: Bearer YOUR_TOKEN_HERE
     ```

5. **Start the application**
   ```bash
   npm start
   ```

### Docker Installation

1. **Create image from Dockerfile**
   ```bash
   docker build -t hard-api-whatsapp .
   ```
   - Make sure you're in the folder where the Dockerfile is located

2. **Run the container**
   ```bash
   docker run -p 3333:3333 hard-api-whatsapp
   ```

## API Manager

Test the API with our web manager interface!

[![API Manager](https://github.com/renatoiub/whatsapp-hard-api-node/blob/v1.6.0/src/public/img/manager.jpg)](https://api.hardcodebr.com.br/teste-api)

[**🔗 Test the API with the Manager!**](https://api.hardcodebr.com.br/teste-api)

## Webhook Events

The API supports the following webhook events:

- `connection.update`
- `qrCode.update`
- `presence.update`
- `contacts.upsert`
- `chats.upsert`
- `chats.delete`
- `messages.update`
- `messages.upsert`
- `call.events`
- `groups.upsert`
- `groups.update`
- `group-participants.update`

## Documentation

- [📋 Postman Collection](https://api.postman.com/collections/26659340-b26b8001-7617-4f56-8f9b-91fa91bda68a)

## API Endpoints Overview

### Instance Management
- Create new instance
- Delete instance
- Get instance info
- Get QR code
- Logout from instance

### Message Operations
- Send text messages
- Send media files
- Send location
- Send contact
- Send reactions
- Reply to messages
- Set typing/recording status

### Group Operations
- Create groups
- Join/leave groups
- Add/remove participants
- Make/remove admins
- Update group settings
- Get group info

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3333
APP_URL=http://localhost:3333

# Security (optional)
PROTECT_ROUTES=false
TOKEN=your-api-token-here
ADMIN_TOKEN=your-admin-token-here

# Session Configuration
SESSION_SECRET=your-session-secret
COOKIE_SECRET=your-cookie-secret

# File Upload Configuration
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/gif,image/webp
ALLOWED_VIDEO_TYPES=video/mp4,video/avi,video/mov,video/quicktime
ALLOWED_AUDIO_TYPES=audio/mpeg,audio/wav,audio/ogg,audio/mp4
ALLOWED_DOCUMENT_TYPES=application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document

# Instance Limits (optional)
MAX_INSTANCES=10
```

## Recent Improvements

This version includes several enhancements:

### 🔧 Technical Improvements
- **Enhanced WebSocket Configuration**: Improved connection stability with optimized timeouts and retry logic
- **Better Error Handling**: Comprehensive error handling for connection failures
- **QR Code Generation Fix**: Resolved empty QR code issues with 15-second timeout logic
- **Session Management**: Fixed session conflicts and improved session restoration

### 🌐 Internationalization
- **Full English Support**: All Portuguese text converted to English
- **Standardized Messages**: Consistent error messages and API responses
- **Clean Codebase**: Variable names and comments in English

### 📦 Additional Features
- **Postman Collection**: Complete API collection for testing
- **Environment Configuration**: Comprehensive `.env` setup
- **Database Folder**: Added to `.gitignore` to prevent session data commits

## Additional Information

- The API doesn't use any external database
- Multi-device support with multiple connected numbers
- Lightweight memory consumption that varies by number of instances
- Built on the reliable Baileys library

## Contributing

Contribute to the project and receive updates:

**Developer**: [renatoiub](https://github.com/renatoiub/)  
**Email**: renatoiub@live.com  
**Instagram**: @renatoiub  

Support the project:  
**PIX**: empresa@estoqueintegrado.com

## License

This project is open source. Feel free to use, modify, and distribute according to your needs.

---

⚠️ **Important**: This is an unofficial WhatsApp API. Use at your own risk and comply with WhatsApp's Terms of Service.