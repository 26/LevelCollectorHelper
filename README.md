# LevelCollectorHelper
Tool to aid in the management of Level Collector groups.

## Getting started

### Prerequisites

Tampermonkey is required for this script to work properly. It can be downloaded via the following links:

* [For Firefox](https://addons.mozilla.org/nl/firefox/addon/tampermonkey/)
* [For Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
* [Via their website](https://tampermonkey.net/)

### Installing

Once you have installed Tampermonkey, copy the script from [GitHub](https://raw.githubusercontent.com/xxmarijnw/LevelCollectorHelper/master/invites.js) and click on the Tampermonkey icon in the toolbar, then on "Dashboard" and click the "+" icon on the right. Remove everything and replace it with the text you've just copied. Press Ctrl+S at the same time to save.

In order for the script to work you must provide your API key, found at https://steamcommunity.com/dev/apikey. Enter your API key on line 22 inbetween the single quotes.

```
var apikey = 'YOURPERSONALAPIKEYGOESHERE'; // ENTER STEAM API KEY HERE (https://steamcommunity.com/dev/apikey)
```

### Usage

A new button will appear on every Level Collectors join request management page that will say something like "Accept Level 10+". Clicking this button will automatically accept every user that is the required level or higher. It may take some time. Once the script has finished it will redirect you to the next Level Collectors group.

#### Fully automatic mode

It is possible to fully automatically handle each group, instead of merely redirecting you to the next group, it redirects you and automatically handles those requests without user input. To enable the fully automatic mode you must type

```
?mode=auto
```

at the end of the URL of the starting group's request management page and press enter. The script will then automatically handle the invites of all groups higher than it. **This can take a long time!**

## Advanced

### Configuration (optional)

By default, the script simply ignores users that don't have the required level and leaves the request open. By changing `ignoreDenyUsers` to `0`, the script will reject users that don't have the required level or have a private profile.

### Debug

Debug mode can be enabled by changing the variable `debug` to `1`.

