# DRIVE MIND — Персональный тренажёр ПДД (кат. B)

> **Автор и владелец: Flenym**
> Цель: выучить билеты за 7–14 дней, офлайн, с интервальным повторением.

## Два трека
- **Expo (кроссплатформа)** — `src/` — Android/Web, отладка на Windows, `npm start`
- **SwiftUI (натив iOS)** — `ios-native/` — основной дистрибутив для iPhone (iOS 17+, Xcode 16)

## Быстрый старт (Expo)
```bash
npm install --legacy-peer-deps
npm test          # jest 13 тестов
npx tsc --noEmit  # typecheck
npx expo start    # Expo Go / dev build
node scripts/import-content/validate.mjs assets/content/demo/questions.json
```

## SwiftUI
```bash
cd ios-native
# если есть XcodeGen: xcodegen generate
open DriveMind.xcodeproj
# Run на симуляторе, Tests — RepetitionTests
```

## База вопросов
Демо 12 вопросов в `assets/content/demo/` (помечены DEMO). Для реальных билетов — положи `questions.json` + `manifest.json` в `assets/content/demo/` и пересобери, либо импортируй через будущий `expo-file-system` загрузчик. Валидация — `scripts/import-content/validate.mjs`.

## Сборка
- CI — `.github/workflows/ci.yml` (typecheck + jest + validate)
- Build — `.github/workflows/build.yml` (Xcode на macos-14 + EAS при наличии `EXPO_TOKEN`)
- Для подписанного IPA нужен Apple Developer + secrets `APPLE_*`/`EXPO_TOKEN` — см. `PROJECT_PLAN.md` §10.

## Лицензии
- Шаблон Expo — MIT (LICENSE)
- Проект — см. LICENSE-FLENYM.md (автор Flenym)
