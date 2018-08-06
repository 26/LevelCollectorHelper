// ==UserScript==
// @name         Level Collector Helper
// @version      1.0
// @description  Tool to aid in the management of Level Collector groups
// @author       xxmarijnw
// @include		 *steamcommunity.com/groups/*/joinRequestsManage
// @supportURL	 https://steamcommunity.com/profiles/76561198179914647
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// ==/UserScript==

(function() {
    'use strict';

    // Check whether the page the user is on right now is actually the correct page
    var url = window.location.href;
    if(url.indexOf("joinRequestsManage") != -1) {
        var apikey = ''; // ENTER STEAM API KEY HERE (https://steamcommunity.com/dev/apikey)

        // Global vars
        var debug = 0; // Used for debugging. Enable debugging by typing "debug = 1" (without the quotes) in the console
        var approvedAccounts = []; // Empty on default
        var deniedAccounts = []; // Empty on default
        var ignoreDenyUsers = 1; // Variable to IGNORE or DENY users that don't meet the required level (deny means the user cannot request to join again for some time, ignore means the join request remains open) (1 = IGNORE, 0 = DENY)

        // Button source code from gemify.js by user SleepyAkubi on GitHub
        function Button(colour, text, place) {
            var iBDiv = null;
            var span = null;

            var buttonHolder = document.createElement('div');
            buttonHolder.className = "flipthis-wrapper";

            var initButton = document.createElement('a');

            iBDiv = document.createElement('div');

            if (colour == "green") {
                iBDiv.className = "btn_small btn_green_white_innerfade lchhelper";
            } else {
                iBDiv.className = "btn_small btn_grey_white_innerfade lchhelper";
            }

            span = document.createElement('span');
            span.innerHTML = text;
            span.className = "";
            iBDiv.appendChild(span);

            initButton.appendChild(iBDiv);

            buttonHolder.appendChild(initButton);

            var row = document.getElementsByClassName(place);
            row[0].appendChild(buttonHolder);

            this.setText = function(newText) {
                span.innerHTML = newText;
            };
            this.remove = function() {
                buttonHolder.parentNode.removeChild(buttonHolder);
                initButton.parentNode.removeChild(initButton);
                iBDiv.parentNode.removeChild(iBDiv);
                span.parentNode.removeChild(span);
            };
        }

        // Check if groupLevel is actually there
        if(groupLevel() != null) {
            var helperButton = new Button("green", "Accept level " + groupLevel() + "+", "btnv6_lightblue_blue btn_details btn_small");
        }

        $J(".lchhelper").click(function(){ joinRequestsManage(); });

        // Automatically get the level of this group
        function groupLevel() {
            // Get the digits in that URL
            var groupLevel = url.match(/\d/g);
            return groupLevel.join("");
        }

        // Get an array of all invites
        function checkInvites() {
            helperButton.setText("Checking invites");

            // Get data-miniprofile from every pending request and put it in the array miniprofiles
            var miniprofiles = $J('.member_block').map(function() { return $J(this).data('miniprofile'); }).get();

            // Show that array in the console (debug)
            if(debug === 1) {
                console.log("data-miniprofile array:" + miniprofiles);
            }

            if (miniprofiles === undefined || miniprofiles.length == 0) {
                // Array empty or does not exist
                helperButton.setText("No join requests");
                console.log("No join requests");
                throw new Error("No join requests");
            }

            // Return array of profiles
            return miniprofiles;
        }

        // Convert data-miniprofile to SteamID64
        function convertID(miniprofile) {
            // Calculate part of the ID that CAN change
            var id = miniprofile + 7960265728;

            // Show that psuedoid in the console (debug)
            if(debug === 1) {
                console.log("PsuedoID64 (" + miniprofile + "):" + id);
            }

            // Add part of the ID that CANNOT change as string (JavaScript cannot handle numbers higher than 9,007,199,254,740,991)
            id = '7656119' + id;

            // Show the full SteamID64 in the console (debug)
            if(debug === 1) {
                console.log("SteamID64 (" + miniprofile + "):" + id);
            }

            // Return ID as string
            return id;
        }

        // Get the level from a SteamID64
        function getLevel(steamid) {
            // Set level as "null" so it can be changed later
            var level = null;

            // Get parameters to send to the Steam API
            var getRequestParams = {
                key: apikey,
                steamid: steamid
            };

            // Show params in the console (debug)
            if(debug === 1) {
                console.log("getRequestParams (" + steamid + "):" + getRequestParams);
            }

            // Send AJAX request to Steam API function GetSteamLevel
            $J.ajax({
                type: 'GET',
                url: 'https://api.steampowered.com/IPlayerService/GetSteamLevel/v1',
                data: getRequestParams,
                // On success
                success: function(data) {
                    // Show raw AJAX data in console (debug)
                    if(debug === 1) {
                        console.log("AJAX data (" + steamid + "):" + data);
                    }

                    // Change level to actual level
                    level = data['response']['player_level'];
                },
                // On fail
                error: function(data) {
                    console.log(data);
                    console.log("API Request failed, is your API key correct?");
                    return "failed";
                },
                // Send this request synchronized
                async: false
            });

            // Return level
            return level;
        }

        function ApproveDenyUser() {
            // Params for approve request
            var approveUserParams = {
                bapprove: '1', // 1 means approve
                sessionID: g_sessionID,
                rgAccounts: approvedAccounts // Array of approved accounts
            };

            // Params for deny request
            var deniedUserParams = {
                bapprove: '0', // 0 means deny
                sessionID: g_sessionID,
                rgAccounts: deniedAccounts // Array of denied accounts
            };

            if(debug === 0) {
                helperButton.setText("Sending request");

                // Approve users
                $J.ajax({
                    type: 'POST',
                    url: g_strProcessURL,
                    data: approveUserParams,
                    async: false
                });

                // Just ignore users if ignoreDenyUsers is set to 1
                if(ignoreDenyUsers === 0) {
                    // Actually deny users if ignoreDenyUsers is set to 0
                    $J.ajax({
                        type: 'POST',
                        url: g_strProcessURL,
                        data: deniedUserParams,
                        async: false
                    });
                }

                // Reload page
                location.reload();
            }
        }

        function joinRequestsManage() {
            helperButton.setText("Busy...");

            var iterate = checkInvites();
            var neededLevel = 9999;
            var attempt = 0;

            getNeededLevel();

            function getNeededLevel() {
                neededLevel = groupLevel();
                attempt += 1;

                helperButton.setText("Getting level needed");

                if(neededLevel < 10 || neededLevel > 1001 || neededLevel == null) {
                    if(attempt <= 5) {
                        console.log("Something went wrong getting group level, retrying... (" + attempt + " / 5)");
                        getNeededLevel();
                    } else {
                        console.log("Something went wrong getting group level. Please refresh and retry manually.");
                        throw new Error("Something went wrong getting group level. Please refresh and retry manually.");
                    }
                }
            }

            // Iterate over all users
            jQuery.each(iterate, function(index, item) {
                // Get ID64 for this user
                var id = convertID(item);

                // Get level of this user
                var level = getLevel(id);

                // Check if level is legit
                if(level == "failed") {
                    console.log("Something went wrong for user " + item + ". Skipping.");
                    return true;
                }

                // Check if level is higher than the needed level
                if(level >= neededLevel) {
                    approvedAccounts.push(item);
                } else {
                    deniedAccounts.push(item);
                }
            });

            ApproveDenyUser();
        }
    }
})();
