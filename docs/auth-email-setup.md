# Authentication email and redirect configuration

## Resend SMTP
1. Verify a DatalytIQs sending domain in Resend and create an SMTP credential.
2. In the Analytics Lab Supabase project, open Authentication → SMTP Settings.
3. Enable custom SMTP and enter Resend's current SMTP host, port, username and generated password.
4. Use a sender such as `DatalytIQs Analytics Lab <learn@your-verified-domain>`.
5. Keep the SMTP password only in Supabase; never commit it or put it in client variables.

## Supabase URL configuration
Set Site URL to `https://datalytiqs-analytics-lab-cfvc.vercel.app`.
Allow both production aliases' `/auth/confirm` paths and the exact callback URL of each active Vercel Preview deployment. Prefer exact Preview hosts over a global `*.vercel.app` rule.

## Confirm-signup template
```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">Confirm email address</a>
```

## Vercel variables
Production: set `NEXT_PUBLIC_SITE_URL=https://datalytiqs-analytics-lab-cfvc.vercel.app` and the Supabase URL plus publishable key.
Preview: configure the Supabase URL and publishable key, but let the application derive its callback from `VERCEL_URL`.

## Verification
Register distinct new addresses from Production and a commit-specific Preview, verify delivery and matching-origin callbacks, test resend and expired links, then save/reload/sign-out/sign-in and confirm exact Stage 01 restoration.
