# Tech Path Push Win-back Checkpoint

This checkpoint adds a consent-led notification onboarding flow, push click attribution for GA4, activity tracking, and automated 7-day / 14-day win-back notifications.

## User flow

1. The analytics banner appears for a new visitor.
2. Clicking **Accept and Continue** grants analytics consent only.
3. A separate Tech Path alert-preferences modal opens.
4. The user chooses new articles, special announcements, learning reminders, and topic preferences.
5. Clicking **Enable Alerts** triggers the browser notification permission prompt.
6. If permission is granted, the Web Push subscription and preferences are saved.
7. Normal visits refresh `lastSeenAt` and reset the win-back journey.
8. A subscribed user with Learning reminders enabled can receive:
   - reminder 1 after 7+ days away;
   - reminder 2 after 14+ days away, only after reminder 1;
   - no third reminder until they return.
9. Returning to Tech Path resets the journey to stage 0.

## Database update

The `WebPushSubscription` Prisma model now includes:

- `learningReminders`
- `lastSeenAt`
- `lastPushClickAt`
- `lastPushCampaign`
- `lastPushId`
- `winBackStage`
- `lastWinBackAt`
- `winBackLockUntil`

Apply this first against a safe preview/staging Neon database:

```bash
npx prisma generate
npx prisma db push
```

Then run the app and verify subscriptions before applying the same additive schema update to production.

## Environment variables

Keep the existing VAPID variables and add:

```env
CRON_SECRET=generate_a_long_random_secret
```

Generate one locally:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Use the same value as the Render/production `CRON_SECRET` and the GitHub Actions repository secret named:

```text
TECH_PATH_CRON_SECRET
```

Never commit either secret.

## Cron route

Dry run:

```bash
curl \
  -H "Authorization: Bearer $CRON_SECRET" \
  "http://localhost:3000/api/cron/win-back?dryRun=1"
```

Real local test:

```bash
curl \
  -H "Authorization: Bearer $CRON_SECRET" \
  "http://localhost:3000/api/cron/win-back"
```

Production dry run:

```bash
curl \
  -H "Authorization: Bearer $CRON_SECRET" \
  "https://path.dev-champions.tech/api/cron/win-back?dryRun=1"
```

Do not trigger a real production send until the production dry-run result is understood.

## Scheduler

`.github/workflows/tech-path-winback.yml` runs daily at 08:15 UTC (09:15 WAT) and calls the secured production route.

The workflow requires the GitHub Actions secret `TECH_PATH_CRON_SECRET`.

## GA4 push attribution

Notification clicks add:

- `utm_source=tech_path`
- `utm_medium=web_push`
- `utm_campaign=<campaign>`
- `utm_content=<push id>` when available
- `push_type`
- `push_campaign`
- `push_id`

When analytics consent is accepted, the app also emits:

```text
push_notification_click
```

with `push_type`, `push_campaign`, and `push_id`. GA4 already supplies device category automatically.

Recommended event-scoped custom dimensions in GA4:

- `push_type`
- `push_campaign`
- `push_id`

## Safe test sequence

### 7-day

Use one test subscription and set:

- `learningReminders = true`
- `lastSeenAt = more than 7 days ago`
- `winBackStage = 0`
- `lastWinBackAt = null`
- `winBackLockUntil = null`

Dry run should report `eligible7Day >= 1`. A real test should deliver reminder 1 and advance the row to stage 1.

### 14-day

Then set:

- `lastSeenAt = more than 14 days ago`
- `winBackStage = 1`
- `lastWinBackAt = more than 6 days ago`
- `winBackLockUntil = null`

Dry run should report `eligible14Day >= 1`. A real test should deliver reminder 2 and advance the row to stage 2.

### Return reset

Click the push or visit Tech Path again. The activity tracker should write:

- `lastSeenAt = now`
- `winBackStage = 0`
- `lastWinBackAt = null`
- `winBackLockUntil = null`

### Opt-out

Set `learningReminders = false`. The same stale subscription must no longer be eligible for win-back reminders.
