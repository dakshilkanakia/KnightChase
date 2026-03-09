# Firebase Setup for KnightChase

## Steps

1. Go to https://console.firebase.google.com
2. Create a new project called `knightchase`
3. Add a **Web app** (even though it's React Native, Expo uses the web SDK)
4. Copy the Firebase config object
5. Enable **Realtime Database**:
   - In the Firebase console, go to **Build > Realtime Database**
   - Click **Create Database**
   - Choose **Start in test mode**
   - Select a region and click **Enable**
6. Enable **Anonymous Authentication**:
   - Go to **Build > Authentication > Sign-in method**
   - Click **Anonymous** and enable it
7. Paste your config into `config/firebase.ts` (replace the existing values)

## Security Rules (for production)

Once you're done testing, update your Realtime Database rules to:

```json
{
  "rules": {
    "rooms": {
      "$roomCode": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```
