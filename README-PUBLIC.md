# EVE Online Public Stats Viewer

A simple Vue.js application that displays **public character information** from EVE Online using the ESI (EVE Swagger Interface) API. This app shows only publicly available data and doesn't require any authentication.

## ✨ Features

- **Character Information**: Name, security status, birthday, age
- **Corporation Details**: Current corp name, ticker, member count, tax rate
- **Alliance Information**: Alliance name, ticker, founding date (if applicable)
- **Public Data Only**: No authentication required - shows only public ESI data
- **Real-time Updates**: Refresh button to get latest data from ESI
- **Modern UI**: Clean, dark theme with responsive design

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd eve-stats
pnpm install
```

### 2. Configure Your Character ID

1. Create a `.env` file in the root directory (or copy from `.env.example`)
2. Set your character ID in the environment variable:
   ```
   VITE_CHARACTER_ID=your_character_id_here
   ```
3. Save the file and restart the development server

#### How to Find Your Character ID:

- **zKillboard**: Go to zkillboard.com and search for your character name. The ID will be in the URL.
- **ESI Search**: Use `https://esi.evetech.net/latest/search/?categories=character&search=YourCharacterName&strict=true`

### 3. Run the Development Server

```bash
pnpm dev
```

Visit `http://localhost:5173` to view your character stats!

## 📊 What You'll See

### ✅ Always Available (Public Data):

- Character name and basic info
- Security status and birthday
- Current corporation name and details
- Alliance information (if in an alliance)
- Corporation member count and tax rate

### ❌ Not Available (Requires Authentication):

- Wallet balance
- Skills and skill points
- Character attributes
- Private character sheet data

## 🎯 Use Cases

Perfect for:

- **Personal dashboards** - Monitor your character's public profile
- **Corp recruitment** - Check basic info about potential members
- **Alliance tools** - Display member corporations and alliances
- **Learning ESI** - Simple example of using EVE's public API

## 🛠 Technical Details

- **Framework**: Vue 3 with TypeScript
- **Styling**: Tailwind CSS
- **API**: EVE Online ESI (public endpoints only)
- **Build Tool**: Vite
- **No Backend**: Pure frontend application

## Usage

1. **Initial Setup**: Set your character ID in the `.env` file as `VITE_CHARACTER_ID`
2. **Refresh Data**: Click the "Refresh" button to fetch the latest data from ESI
3. **Monitor Stats**: Keep track of your character's public information and corp/alliance status

## API Limitations

- This application uses **public ESI endpoints only** - no authentication required
- Only publicly available character data is shown
- ESI has rate limits - the app includes respectful delays between requests
- Corporation data shows current affiliation based on the character's public profile

## Troubleshooting

**Character data not loading?**

- Verify your character ID is correct in the `.env` file
- Ensure your internet connection can reach `esi.evetech.net`
- Restart the development server after changing the `.env` file

**Corporation shows old data?**

- ESI updates can take time to reflect character moves
- Try refreshing after a few minutes if you recently changed corps

## Technologies Used

- **Vue 3** - Frontend framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool and dev server
- **Axios** - HTTP client for ESI requests
- **ESI API** - EVE Online's official API

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This application is not affiliated with EVE Online or CCP Games. EVE Online is a trademark of CCP hf.
