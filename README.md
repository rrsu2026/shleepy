# Shleepy

Shleepy is a social sleep tracker app that promotes healthy, high-quality rest among friends. Log your bedtimes, see your sleep trends, and compete against friends.

---

## Features Overview

### Log Sleep Tab
This screen is straightforward. It allows users to log their bedtimes and wake times to calculate their time slept overnight.

- **Date Display**: Shows the current date for logging.
- **Database Fetching and Writing**: Retrieves sleep data from Supabase if available and writes to Supabase upon clicking “Log Sleep.”
- **Notes**: 
  - Uses a date-time picker for easy selection without manual input.
  - Simplifies the process by allowing users to log bedtime and wake time directly.

---

### Friends Tab
The Friends Tab showcases the social features of the sleep app. It renders friends' sheep on a vertical scale, representing how much sleep each friend logged overnight. Key features:

- **Friend Architecture**:
  - Supabase includes a friendships table that pairs user IDs with statuses: `accepted`, `pending`, or `rejected`.
  - These statuses have relations to UUIDs in the users table.

- **Add Friends**:
  - Add button on the top-right corner leads to a modal page with three sections:
    1. **Enter Username**: Sends a request with a `pending` status.
    2. **Friend Requests**: Users can accept or deny incoming requests, updating the database.
    3. **Suggested Friends**: Lists potential friends from the database who are not yet connected.

- **Friend Data**:
  - Displays friends' weekly sleep averages, healthy sleep percentages, and logging streaks.
  - Clicking a sheep brings up more details.

- **Other Notes**:
  - Horizontal sheep positions are randomly generated for a dynamic feel.
  - Sheep animations create a fun floating effect.
  - If a friend doesn’t log data, their sheep is placed on the grass with the message "No data today."

---

### Profile Tab
The Profile Tab displays user-specific analytics and account settings, with a cute sheep animation for visual appeal.

- **Stats**:
  - Shows "Week in Review" data: sleep averages, healthy sleep percentages (7-9 hours), and streaks.
  - Links to a "More Stats" page with visualizations (line charts and histograms) for sleep data.

- **Edit Profile**:
  - Users can update display names and usernames.
  - Changes are reflected in the Supabase database and synced frequently.

- **Explore Insights**:
  - Fetches user location and integrates data from environment-related APIs.
  - Displays local information such as temperature, humidity, sunrise/sunset times, and daily sleep tips.

- **Other Notes**:
  - Celsius is used for temperature.

---

### Login Flow
The app includes login and signup pages using Supabase authentication.

---

## Figma and Branding
Custom assets were built for the project using Figma. View the assets here:
[Figma Design Library](https://www.figma.com/design/wubVLviVU3Xuw9wp5h50DN/Renn's-team-library?m=auto&t=Ia2jXR82bfLcllYx-6)
