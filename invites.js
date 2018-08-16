// ==UserScript==
// @name         Level Collector Helper
// @version      1.1
// @description  Tool to aid in the management of Level Collector groups
// @author       xxmarijnw
// @include      *steamcommunity.com/groups/*/joinRequestsManage*
// @supportURL   https://steamcommunity.com/profiles/76561198179914647
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// ==/UserScript==

(function() {
    'use strict';

    // USER CHANGEABLE VARS (DO NOT CHANGE ANYTHING ELSE)
    const apikey = ''; // ENTER STEAM API KEY HERE (https://steamcommunity.com/dev/apikey)
    const debug = 0; // Used for debugging
    const ignoreDenyUsers = 0; // Variable to IGNORE or DENY users that don't meet the required level (deny means the user cannot request to join again for some time, ignore means the join request remains open) (1 = IGNORE, 0 = DENY)
    // END OF USER CHANGEABLE VARS

    // Global stuff
    var approvedAccounts = []; // Empty on default
    var deniedAccounts = []; // Empty on default

    // Var containing all the groups
    const groups = ['level10collector','level20collector','level30collector','level40collector','level50collector','level60collector','level70collector','level80collector','level90collector','level100collector','level110collector','level120collector','level130collector','level140collector','level150collector','level160collector','level170collector','level180collector','level190collector','level200collector','leveI210collector','leveI220collector','leveI230collector','leveI240collector','leveI250collector','leveI260collector','leveI270collector','leveI280collector','leveI290collector','leveI300collector','level310coIIector','level320coIIector','level330coIIector','level340coIIector','level350coIIector','level360coIIector','level370coIIector','level380collector','level390collector','level400coIIector','IeveI410coIIector','IeveI420coIIector','IeveI430coIIector','IeveI440coIIector','IeveI450coIIector','IeveI460coIIector','IeveI470coIIector','IeveI480coIIector','IeveI490coIIector','IeveI500coIIector','IeveI510coIIector','level520coIIector','IeveI530coIIector','level540coIIector','level550coIIector','level560coIIector','level570coIIector','level580coIIector','level590coIIector','level600coIIector','level610colIector','level620colIector','level630colIector','level640colIector','level650colIector','level660colIector','level670colIector','level680colIector','level690colIector','level700colIector','level710colIector','level720colIector','level730colIector','level740colIector','level750colIector','level760colIector','level770colIector','level780colIector','level790colIector','level800colIector','level810coIIector','level820coIIector','level830coIIector','level840coIIector','level850coIIector','level860coIIector','level870coIIector','level880coIIector','level890coIIector','level900coIIector','level910coIIector','level920coIIector','level930coIIector','level940coIIector','level950coIIector','level960coIIector','level970coIIector','level980coIIector','level990coIIector','leveI1000coIIector'];

    // Simple function to split the URL in segments in order to get the group name
    const urlsegments = window.location.pathname.split('/');
    const groupname = urlsegments[2];

    // Function to get parameters (GET parameters) from the URL
    function getUrlParameter(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    }

    // Reload
    function Reload() {
        if(debug === 0) {
            location.reload();
        }
    }

    // Function to redirect you to the next Level Collectors group
    function Redirect() {
        // Do not redirect if it is the last group (level 1000)
        if((groupname != 'leveI1000coIIector') && (debug === 0)) {
            // Get next item in the groups array
            var index = groups.indexOf(groupname);
            if(index >= 0 && index < groups.length - 1) {
                var nextItem = groups[index + 1];

                if (nextItem == null) {
                    // Just reload when nothing was found
                    Reload();
                } else {
                    // Redirect to the next group if it exists
                    window.location.href = "https://steamcommunity.com/groups/" + nextItem + "/joinRequestsManage" + mode;
                }
            } else {
                // Just reload when nothing was found
                Reload();
            }
        }
    }

    // Button source code from gemify.js by user SleepyAkubi on GitHub (edited by me)
    function Button(colour, text, place) {
        // Define span
        var span = null;

        // Create new anchor element
        var buttonHolder = document.createElement('a');
        // Give said element some colours
        buttonHolder.className = "btnv6_blue_blue_innerfade btn_details btn_small lchhelper";

        // Create new span element
        span = document.createElement('span');
        span.innerHTML = text;
        span.className = "";

        // Append the span inside of the anchor
        buttonHolder.appendChild(span);

        // Place where button should be placed
        var row = document.getElementsByClassName(place);
        // Place button infront of there
        row[0].prepend(buttonHolder);

        this.setText = function(newText) {
            span.innerHTML = newText;
        };

        this.remove = function() {
            buttonHolder.parentNode.removeChild(buttonHolder);
            span.parentNode.removeChild(span);
        };
    }

    // Automatically get the level of this group
    function groupLevel() {
        // Get URL
        var url = window.location.href;
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
            console.log("miniprofiles (checkInvites): " + miniprofiles);
        }

        if (miniprofiles === undefined || miniprofiles.length == 0) {
            // Array empty or does not exist
            helperButton.setText("No join requests");
            console.log("No join requests");

            // Throw error and stop execution of JavaScript
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
            console.log("psuedoid (convertID, " + miniprofile + "): " + id);
        }

        // Add part of the ID that CANNOT change as string (JavaScript cannot handle numbers higher than 9,007,199,254,740,991)
        id = '7656119' + id;

        // Show the full SteamID64 in the console (debug)
        if(debug === 1) {
            console.log("id (convertID, " + miniprofile + "): " + id);
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
            key: apikey, // API key defined in global vars
            steamid: steamid // SteamID from function
        };

        // Show params in the console (debug)
        if(debug === 1) {
            console.log("getRequestParams (getLevel, " + steamid + "): " + getRequestParams);
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
                    console.log("data (getLevel, " + steamid + "): " + data);
                }

                // Change level to actual level
                level = data.response.player_level;
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

        if(debug === 1) {
            console.log("level (getLevel, " + steamid + "): " + level);
        }

        // Return level
        return level;
    }

    // Actually send the requests to Steam to accept or deny users
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

        // Doesn't execute when debug is enabled, nothing really happens
        if(debug === 0) {
            helperButton.setText("Sending requests");

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

            // Redirect
            Redirect();
        } else {
            console.log("approveUserParams (ApproveDenyUser): " + approveUserParams);
            console.log("deniedUserParams (ApproveDenyUser): " + deniedUserParams);

            helperButton.setText("Debug finished");
        }
    }

    // Set attempt to 0 for the getNeededLevel() function
    var attempt = 0;
    // Function to get the level needed for this group
    function getNeededLevel() {
        // Set neededLevel to arbitrary high number for safety
        var neededLevel = 9999;

        helperButton.setText("Getting level needed");

        neededLevel = groupLevel();
        attempt += 1;

        if(neededLevel < 10 || neededLevel > 1001 || neededLevel == null) {
            if(attempt <= 5) {
                console.log("Something went wrong getting group level, retrying... (" + attempt + " / 5)");
                getNeededLevel();
            } else {
                helperButton.setText("Error getting required level");
                console.log("Something went wrong getting group level. Please refresh and retry manually.");

                helperButton.setText("Error getting group's level");

                throw new Error("Something went wrong getting group level. Please refresh and retry manually.");
            }
        }

        if(debug === 1) {
            console.log('neededLevel (getNeededLevel): ' + neededLevel);
        }

        return neededLevel;
    }

    // Main function
    function joinRequestsManage() {
        helperButton.setText("Busy...");

        if(apikey === '') {
            helperButton.setText("Missing API key");
            console.log("Missing API key");

            // Throw error and stop execution of JavaScript
            throw new Error("Missing API key");
        }

        // Get array of users to iterate over
        var iterate = checkInvites();

        // Call getNeededLevel()
        var neededLevel = getNeededLevel();

        // Iterate over all users
        jQuery.each(iterate, function(index, item) {
            helperButton.setText("Checking each user");

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
            if(level >= neededLevel && neededLevel !== null) {
                // Approve account and add to array of approvedAccounts
                approvedAccounts.push(item);
            } else {
                // Deny account and add to the array of deniedAccounts
                deniedAccounts.push(item);
            }
        });

        if(debug === 1) {
            console.log('approvedAccounts (joinRequestsManage): ' + approvedAccounts);
            console.log('deniedAccounts (joinRequestsManage): ' + deniedAccounts);
        }

        // Call ApproveDenyUser()
        ApproveDenyUser();
    }

    // Check whether the page the user is on right now is actually a level collectors page
    if(jQuery.inArray(groupname, groups) !== -1) {
        // Check if groupLevel is actually there
        if(groupLevel() != null) {
            // Create button with these parameters
            var helperButton = new Button("green", "Accept level " + groupLevel() + "+", "joinRequestManageButtons");
        }

        // Simple function to check if the button was pressed and disable that button afterwards
        var isDisabled = false;
        $J(".lchhelper").click(function(){
            if(isDisabled === false) {
                joinRequestsManage();
                isDisabled = true;
            }
        });

        // Check mode for automation
        var mode = getUrlParameter('mode');

        // If the mode is auto, automatically execute joinRequestsManage() and disable the button
        if(mode == 'auto') {
            isDisabled = true;
            joinRequestsManage();
            mode = '?mode=auto';
        } else {
            mode = '';
        }
    }
})();
