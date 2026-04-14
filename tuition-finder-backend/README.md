# Tuition Finder Backend

## Requirements

- Node.js 20+
- MongoDB running locally or a MongoDB URI
- Redis running locally or a Redis URL

## Setup

1. Install dependencies

```bash
npm install
```

2. Create `.env` from `.env.example`

```bash
copy .env.example .env
```

3. Start server

```bash
npm run dev
```

Server runs on `http://localhost:5000`.

## Endpoints

- `GET /health`

Auth (`/api/auth`)
- `POST /register`
- `POST /verify-email`
- `POST /login`
- `POST /refresh`
- `POST /logout`
- `POST /forgot-password`
- `POST /reset-password`
- `POST /resend-otp`

Users (`/api/users`)
- `GET /me`
- `PUT /me`
- `POST /me/photo`
- `PUT /me/change-password`

Tutors (`/api/tutors`)
- `GET /`
- `GET /:tutorId`
- `POST /profile`
- `PUT /profile`
- `PUT /profile/status`
- `GET /profile/stats`

Bookings (`/api/bookings`)
- `POST /`
- `GET /`
- `GET /:bookingId`
- `PUT /:bookingId/confirm`
- `PUT /:bookingId/cancel`
- `PUT /:bookingId/complete`

Saved (`/api/saved`)
- `GET /`
- `POST /:tutorId`
- `DELETE /:tutorId`

Reviews (`/api/reviews`)
- `POST /`
- `GET /tutor/:tutorId`

Messages (`/api/messages`)
- `GET /conversations`
- `POST /conversations`
- `GET /conversations/:conversationId`
- `POST /conversations/:conversationId/messages`

Notifications (`/api/notifications`)
- `GET /`
- `PUT /read-all`
- `PUT /:notificationId/read`
