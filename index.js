import tmi from 'tmi.js';
import * as spotifyBuddylist from 'spotify-buddylist'
import dotenv from 'dotenv'
dotenv.config()

let last_check_time = 0;

const spDcCookie = process.env.SPOTIFY

async function get_last_song() {
    // Only run every 20 seconds
    if (Date.now() - last_check_time < 20000) {
        return null;
    }
    last_check_time = Date.now()

    const { accessToken } = await spotifyBuddylist.getWebAccessToken(spDcCookie)
    const friendActivity = await spotifyBuddylist.getFriendActivity(accessToken)


    for (const friend of friendActivity.friends) {
        if (friend.user.uri === process.env.SPOTIFY_USER) {
            let timestamp = new Date(friend.timestamp);
            let time_diff_minutes = (Date.now() - timestamp) / 60000;
            time_diff_minutes = Math.floor(time_diff_minutes)
            let response = friend.track.name + " - " + friend.track.artist.name + " (" + time_diff_minutes + " minutes ago)";
            console.log(response);
            return response;
        }
    }
    return null;
}


const client = new tmi.Client({
	options: { debug: true },
	identity: {
		username: process.env.TWITCH_USER,
		password: process.env.TWITCH_AUTH
	},
	channels: [ process.env.TWITCH_CHANNEL ]
});
client.connect().catch(console.error);
client.on('message', async (channel, tags, message, self) => {
	if(self) return;

	if(message.toLowerCase() === '!song') {
        let message = await get_last_song();
        if (message === null) {
            return;
        }
		client.say(channel, `@${tags.username} now playing: ${message}`);
	}
});



