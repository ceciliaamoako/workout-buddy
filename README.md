# GymBuddy

A responsive React + TypeScript portfolio app for finding **platonic workout partners** and helping people who feel nervous walking into a commercial gym alone.

The core product idea is simple: instead of matching only by generic fitness interests, GymBuddy lets someone find a person who already knows a **specific gym** and is willing to meet at the entrance, or find another first-timer so they can figure it out together.

## Demo features

- Discover workout buddies with filters for gym, workout type, gender preference, and weight range
- Dedicated **Walk-in Companion** mode for first-time or nervous gym-goers
- Save/unsave promising matches
- Request a session with workout, date, time, and message
- View and cancel pending session requests
- Editable user profile and matching preferences
- Browser persistence with `localStorage`
- Responsive desktop and mobile layouts
- Explicitly platonic, workout-focused product positioning

## Tech stack

- React
- TypeScript
- Vite
- CSS
- Browser `localStorage` for demo persistence

## Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in your terminal.

## Production build

```bash
npm run build
npm run preview
```

## Current architecture

This repository is intentionally a **front-end portfolio/demo implementation**. The people, gym names, ratings, and session data are fictional mock data. Actions such as saving profiles and session requests persist only in the browser.

That makes the project easy to run for recruiters while leaving clear room for a production backend.

## Production roadmap

Planned next steps for a real public release:

1. Authentication and user onboarding
2. PostgreSQL-backed profiles, gyms, availability, and sessions
3. Geolocation / gym search integration
4. Real matching and compatibility scoring
5. Mutual session acceptance and in-app messaging
6. Reporting, blocking, moderation, and safety controls
7. Email/push notifications
8. Profile verification and anti-dating / anti-solicitation safeguards
9. Automated tests and CI/CD
10. Deployment of the frontend and API

## Product principles

GymBuddy is designed to be:

- **Platonic:** not a dating app
- **Peer-based:** buddies are not paid personal trainers
- **Gym-specific:** familiarity with the actual location matters
- **Low pressure:** useful for first-timers and experienced gym-goers alike
- **Safety-conscious:** public-gym meetups, clear boundaries, and moderation are part of the production roadmap

## Suggested GitHub description

> GymBuddy is a React + TypeScript web app that matches gym-goers by location, workout style, preferences, and experience—including a walk-in companion flow for people nervous about going to the gym alone.
