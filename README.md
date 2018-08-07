# LevelCollectorHelper
Tool to aid in the management of Level Collector groups.

## Getting started

### Prerequisites

Tampermonkey is required for this script to work properly. It can be downloaded via the following links:

* [For Firefox](https://addons.mozilla.org/nl/firefox/addon/tampermonkey/)
* [For Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
* [Via their website](https://tampermonkey.net/)

### Installing

Once you have installed Tampermonkey, copy the script from [GitHub](https://raw.githubusercontent.com/xxmarijnw/LevelCollectorHelper/master/invites.js) and click on the Tampermonkey icon in the toolbar, then on "Dashboard". Click the "+" icon on the right. Then remove everything there and replace it with the text you've just copied and press Ctrl and S at the same time to save.

In order for the script to work you must provide you API key, which can be found on https://steamcommunity.com/dev/apikey. You must enter your API key on line 22 inbetween the single quotes.

```
var apikey = 'YOURPERSONALAPIKEYGOESHERE'; // ENTER STEAM API KEY HERE (https://steamcommunity.com/dev/apikey)
```

### Usage

A new button will appear on every Level Collectors join request management page that will say something like "Accept Level 10+". Clicking this button will accept every user that is the required level or higher automatically. It might take some time. Once the script has finished it will redirect you to the next Level Collectors group; if you clicked the button on the Level 180 group it will automatically go to the Level 190 group for you.

#### Fully automatic mode

It is possible fully automatically handle each group, instead of merely redirecting you to the next group. To enable the fully automatic mode you must type

```
?mode=auto
```

at the end of the URL of the starting group's request management page. The script will then automatically handle the invites of all groups higher than it. This can take a long time!

## Advanced

### Configuration (optional)

On default, the script simply ignores users that don't have the required level and leaves the request open. By changing `ignoreDenyUsers` to `0`, the script will reject users that don't have the required level or have a private profile.

### Debug

Debug can be enabled by changing the variable `debug` to `1`.

