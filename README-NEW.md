# EVE Online Statistics Dashboard

A Vue.js web application that displays your EVE Online character statistics using the official EVE Swagger Interface (ESI) API.

## Features

- 💰 **Wallet Tracking** - Monitor your ISK balance
- 🎓 **Skill Management** - View skills, skill points, and training progress
- 📅 **Training Queue** - See current skill training and completion times
- 📦 **Asset Overview** - Overview of your assets across stations and structures
- 🏢 **Corporation Info** - Display corporation and alliance information
- 🔒 **Secure Authentication** - Uses EVE Online's OAuth2 SSO system

## Setup Instructions

### 1. Register Your Application

1. Go to [EVE Developers](https://developers.eveonline.com/)
2. Log in with your EVE Online account
3. Create a new application with the following settings:
   - **Application Name**: Your app name (e.g., "EVE Stats Dashboard")
   - **Description**: Brief description of your app
   - **Connection Type**: Authentication & API Access
   - **Permissions**: Select the following scopes:
     - `esi-wallet.read_character_wallet.v1`
     - `esi-skills.read_skills.v1`
     - `esi-skills.read_skillqueue.v1`
     - `esi-clones.read_clones.v1`
     - `esi-characters.read_character_info.v1`
     - `esi-assets.read_assets.v1`
   - **Callback URL**: `http://localhost:5173/callback` (for development)

### 2. Configure Environment Variables

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and update with your application details:
   ```env
   VITE_EVE_CLIENT_ID=your-actual-client-id-here
   VITE_EVE_REDIRECT_URI=http://localhost:5173/callback
   VITE_EVE_SCOPES=esi-wallet.read_character_wallet.v1 esi-skills.read_skills.v1 esi-skills.read_skillqueue.v1 esi-clones.read_clones.v1 esi-characters.read_character_info.v1 esi-assets.read_assets.v1
   ```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Run the Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

## ESI API Authorization Flow

This application uses the PKCE (Proof Key for Code Exchange) OAuth2 flow for secure authentication:

1. **Authorization Request**: User clicks "Login with EVE Online"
2. **User Consent**: Redirected to EVE SSO for authentication and scope approval
3. **Authorization Code**: EVE redirects back with authorization code
4. **Token Exchange**: Code is exchanged for access and refresh tokens
5. **API Calls**: Access token is used to make authenticated ESI API requests

### Key Components

#### `useEveAuth.ts`

- Handles OAuth2 authentication flow
- Manages access and refresh tokens
- Implements PKCE for security

#### `useEsiApi.ts`

- Provides typed API methods for ESI endpoints
- Handles token refresh automatically
- Includes error handling and retry logic

#### Security Features

- PKCE code challenge/verifier for OAuth2
- Automatic token refresh
- Secure token storage
- State parameter validation

## API Endpoints Used

| Endpoint                                 | Description                       |
| ---------------------------------------- | --------------------------------- |
| `/characters/{character_id}/`            | Character information             |
| `/characters/{character_id}/wallet/`     | Wallet balance                    |
| `/characters/{character_id}/skills/`     | Character skills and skill points |
| `/characters/{character_id}/skillqueue/` | Current skill training queue      |
| `/characters/{character_id}/assets/`     | Character assets                  |
| `/corporations/{corporation_id}/`        | Corporation information           |
| `/alliances/{alliance_id}/`              | Alliance information              |

## Code Examples

### Making an API Call

```typescript
import { useEsiApi } from '@/composables/useEsiApi'

const { getCharacterInfo, getCharacterWallet } = useEsiApi()

// Get character information
const characterInfo = await getCharacterInfo(characterId)

// Get wallet balance
const balance = await getCharacterWallet(characterId)
```

### Authentication

```typescript
import { useEveAuth } from '@/composables/useEveAuth'

const { login, logout, isAuthenticated, tokenData } = useEveAuth()

// Start OAuth flow
login()

// Check authentication status
if (isAuthenticated.value) {
  console.log('Logged in as:', tokenData.value?.character_name)
}
```

## Production Deployment

For production deployment:

1. Update the callback URL in your EVE developer application
2. Update `VITE_EVE_REDIRECT_URI` in your environment variables
3. Build the application: `pnpm build`
4. Deploy the `dist` folder to your web server

## Error Handling

The application includes comprehensive error handling for:

- Network timeouts and connection issues
- Invalid or expired tokens
- ESI API rate limiting
- Missing permissions/scopes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Disclaimer

This application is not affiliated with or endorsed by CCP Games or EVE Online. EVE Online and the EVE logo are the registered trademarks of CCP hf.
