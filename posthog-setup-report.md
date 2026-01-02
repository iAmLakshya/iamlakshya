# PostHog post-wizard report

The wizard has completed a deep integration of your Next.js portfolio project. PostHog is now set up to track user engagement with your social links, project showcases, and resume views. The integration uses the modern `instrumentation-client.ts` approach (recommended for Next.js 15.3+) with a reverse proxy configuration for improved reliability against ad blockers.

## Integration Summary

### Files Created
- `.env` - Environment variables for PostHog API key and host
- `instrumentation-client.ts` - Client-side PostHog initialization with error tracking enabled

### Files Modified
- `next.config.ts` - Added reverse proxy rewrites for PostHog ingestion
- `components/social-link.tsx` - Added click tracking for social media links
- `components/list.tsx` - Added click tracking for project links
- `components/experience.tsx` - Added click tracking for resume/CV links
- `app/not-found.tsx` - Added tracking for 404 recovery navigation

## Events Tracked

| Event Name | Description | File |
|------------|-------------|------|
| `social_link_clicked` | User clicks on a social media link (GitHub, LinkedIn, Email, Instagram) | `components/social-link.tsx` |
| `project_link_clicked` | User clicks on a project link to view more details or source code | `components/list.tsx` |
| `resume_link_clicked` | User clicks on the 'View full resume' link to see complete work history | `components/experience.tsx` |
| `not_found_back_clicked` | User clicks 'Head back' link from the 404 page to return home | `app/not-found.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

### Dashboard
- [Analytics basics](https://eu.posthog.com/project/112352/dashboard/473574) - Main dashboard with all portfolio analytics

### Insights
- [Social Links Clicked by Platform](https://eu.posthog.com/project/112352/insights/T5OZvSQL) - Breakdown of social link clicks by platform
- [Project Link Engagement](https://eu.posthog.com/project/112352/insights/mXeJqOb8) - Track which projects are getting the most interest
- [Resume Views](https://eu.posthog.com/project/112352/insights/w7CrTreR) - Track when visitors click to view the full resume
- [404 Recovery Rate](https://eu.posthog.com/project/112352/insights/cWv01CoG) - Track users navigating back from 404 pages
- [Social to Resume Conversion Funnel](https://eu.posthog.com/project/112352/insights/ggcZ90Ui) - Funnel showing visitors who engage with social links and then view the resume

## Configuration Details

- **PostHog Host**: EU region (`https://eu.i.posthog.com`)
- **Reverse Proxy**: Enabled via Next.js rewrites at `/ingest/*`
- **Error Tracking**: Enabled with `capture_exceptions: true`
- **Debug Mode**: Enabled in development environment
