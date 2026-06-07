# CondoEase Mobile Frontend

Tenant mobile app for CondoEase. This project is a Next.js app exported as static files and wrapped as an Android app with Capacitor.

## Requirements

- Node.js 20 or newer
- pnpm
- Java JDK 17 or newer
- Android Studio or Android SDK command-line tools
- Android platform tools/ADB for installing to a phone

## Environment

Create `.env.local` in this folder:

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
NEXT_PUBLIC_APP_URL=https://your-mobile-app.vercel.app
```

For local backend testing:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`NEXT_PUBLIC_API_URL` is baked into the static app during build, so update it before running `pnpm build`, `pnpm android:sync`, or APK commands.

## Install

```bash
pnpm install
```

## Run In Browser

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

## Validate Before Building

```bash
pnpm lint
pnpm build
```

The static web output is written to:

```text
out/
```

## Sync To Android

Run this after changing code, environment variables, public assets, or app icons:

```bash
pnpm android:sync
```

This runs `pnpm build` and copies the latest `out/` build into the Capacitor Android project.

## Build Debug APK

```bash
pnpm android:build
```

The debug APK is created at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## Install Debug APK To Phone

Enable USB debugging on the Android phone, connect it by USB, then run:

```bash
pnpm android:install
```

You can also install the generated debug APK manually from:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## Build Release APK

First sync the latest web build:

```bash
pnpm android:sync
```

Then build release from the Android folder:

```bash
cd android
gradlew.bat assembleRelease
```

The release APK is created at:

```text
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

For Play Store or production distribution, sign the release APK with your Android keystore before sharing it.

## Open In Android Studio

```bash
pnpm android:sync
npx cap open android
```

Use Android Studio if you need emulator testing, release signing, Gradle configuration, or Play Store build setup.

## Deployment Notes

- Deploy the mobile web app from this `mob-frontend` folder.
- Set `NEXT_PUBLIC_API_URL` in the hosting provider before building.
- Add the deployed mobile URL to the backend `CLIENT_ORIGIN`.
- Set the backend `XENDIT_RETURN_URL_BASE` to the mobile app URL so Xendit can return to the app after payment.
- Re-run `pnpm android:sync` and rebuild the APK after changing URLs or environment variables.

## Useful Commands

```bash
pnpm dev
pnpm lint
pnpm build
pnpm android:sync
pnpm android:build
pnpm android:install
```
