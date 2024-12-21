import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with your project's URL and public API key
const supabaseUrl = "https://giuylbiphrofeiephgru.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpdXlsYmlwaHJvZmVpZXBoZ3J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5MjY2MzIsImV4cCI6MjA0ODUwMjYzMn0.Ail0NeUxmrEBoloTW57gexaf9kCm1t-iT2Rl_zVZvyo";

const supabase = createClient(supabaseUrl, supabaseAnonKey);


async function fetchAndLogFriends(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('friends(friend_username, friend_display_name, friend_profile_picture, friend_sleep_hours)')
      .eq('id', userId);

    if (error) {
      console.error('Error fetching friends:', error);
      return;
    }

    if (data && data.length > 0 && data[0].friends) {
      data[0].friends.forEach(friend => {
        console.log('Username:', friend.friend_username);
        console.log('Display Name:', friend.friend_display_name);
        console.log('Profile Picture URL:', friend.friend_profile_picture);
        console.log('Sleep Hours:', friend.friend_sleep_hours);
        console.log('---');
      });
    } else {
      console.log('No friends found for this user.');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Replace 'your-user-id' with the actual user ID you want to query
fetchAndLogFriends("5eb30c35-80aa-4ad8-a9f5-1b1561244672");
