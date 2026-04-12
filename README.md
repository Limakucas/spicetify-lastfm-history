# spicetify-lastfm-history

A [Spicetify](https://spicetify.app) custom app that displays your [last.fm](https://last.fm) top artists, tracks, and albums across multiple time periods, right inside the Spotify desktop client. Click any item to jump to its Spotify page.

## Install

```sh
git clone https://github.com/traxaber/spicetify-lastfm-history.git
ln -s "$PWD/spicetify-lastfm-history" "$(dirname "$(spicetify -c)")/CustomApps/lastfm-history"
spicetify config custom_apps lastfm-history
spicetify apply
```

Then open Spotify and find **Last.fm History** in the left sidebar.

## Configure

Edit the top of `index.js`:

- `LASTFM_API_KEY` — get one free at <https://www.last.fm/api/account/create>
- `LASTFM_USER` — your last.fm username

## How it works

- Pulls `user.gettopartists` / `gettoptracks` / `gettopalbums` from the last.fm API for the selected period (`7day`, `1month`, `3month`, `6month`, `12month`, `overall`).
- On click, queries the Spotify search API via `Spicetify.CosmosAsync` and navigates to the first match using `Spicetify.Platform.History.push`.

No build step — pure vanilla JS using `Spicetify.React.createElement`.
