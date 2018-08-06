// ==UserScript==
// @name         Level Collector Helper
// @version      1.0
// @description  Tool to aid in the management of Level Collector groups
// @author       xxmarijnw
// @include      *steamcommunity.com/groups/*/joinRequestsManage
// @supportURL   https://steamcommunity.com/profiles/76561198179914647
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// ==/UserScript==

(function() {
    'use strict';

    var groups = ['level10collector','level20collector','level30collector','level40collector','level50collector','level60collector','level70collector','level80collector','level90collector','level100collector','level110collector','level120collector','level130collector','level140collector','level150collector','level160collector','level170collector','level180collector','level190collector','level200collector','leveI210collector','leveI220collector','leveI230collector','leveI240collector','leveI250collector','leveI260collector','leveI270collector','leveI280collector','leveI290collector','leveI300collector','level310coIIector','level320coIIector','level330coIIector','level340coIIector','level350coIIector','level360coIIector','level370coIIector','level380collector','level390collector','level400coIIector','IeveI410coIIector','IeveI420coIIector','IeveI430coIIector','IeveI440coIIector','IeveI450coIIector','IeveI460coIIector','IeveI470coIIector','IeveI480coIIector','IeveI490coIIector','IeveI500coIIector','IeveI510coIIector','level520coIIector','IeveI530coIIector','level540coIIector','level550coIIector','level560coIIector','level570coIIector','level580coIIector','level590coIIector','level600coIIector','level610colIector','level620colIector','level630colIector','level640colIector','level650colIector','level660colIector','level670colIector','level680colIector','level690colIector','level700colIector','level710colIector','level720colIector','level730colIector','level740colIector','level750colIector','level760colIector','level770colIector','level780colIector','level790colIector','level800colIector','level810coIIector','level820coIIector','level830coIIector','level840coIIector','level850coIIector','level860coIIector','level870coIIector','level880coIIector','level890coIIector','level900coIIector','level910coIIector','level920coIIector','level930coIIector','level940coIIector','level950coIIector','level960coIIector','level970coIIector','level980coIIector','level990coIIector','leveI1000coIIector'];
    
    var urlsegments = window.location.pathname.split('/');
    var groupname = urlsegments[2];
    
    // Check whether the page the user is on right now is actually a level collectors page
    if(jQuery.inArray(groupname, groups) !== -1) {
        
            function Redirect() {
            // Get next item in the groups array
            var index = groups.indexOf(groupname);
            if(index >= 0 && index < groups.length - 1) {
                var nextItem = groups[index + 1];
            
                if (nextItem == null) {
                    // Just reload when nothing was found
                    location.reload();
                } else {
                    // Redirect to the next group if it exists
                    window.location.href = "https://steamcommunity.com/groups/" + nextItem + "/joinRequestsManage";
                }
            } else {
                // Just reload when nothing was found
                location.reload();
            }
        }
        
        function Reload() {
            location.reload();
        }
        
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

            var buttonHolder = document.createElement('a');
            buttonHolder.className = "btnv6_blue_blue_innerfade btn_details btn_small lchhelper";

            span = document.createElement('span');
            span.innerHTML = text;
            span.className = "";
            buttonHolder.appendChild(span);

            var row = document.getElementsByClassName(place);
            row[0].prepend(buttonHolder);

            this.setText = function(newText) {
                span.innerHTML = newText;
            };
            
            this.remove = function() {
                buttonHolder.parentNode.removeChild(buttonHolder);
                span.parentNode.removeChild(span);
            };
        }

        // Check if groupLevel is actually there
        if(groupLevel() != null) {
            var helperButton = new Button("green", "Accept level " + groupLevel() + "+", "joinRequestManageButtons");
        }

        $J(".lchhelper").click(function(){ joinRequestsManage(); });

        // Automatically get the level of this group
        function groupLevel() {
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
                console.log("data-miniprofile array:" + miniprofiles);
            }

            if (miniprofiles === undefined || miniprofiles.length == 0) {
                // Array empty or does not exist
                helperButton.setText("No join requests");
                console.log("No join requests");
                
                Redirect();
                
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
                
                Redirect();
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
                        helperButton.setText("Error getting required level");
                        console.log("Something went wrong getting group level. Please refresh and retry manually.");
                        
                        Reload();
                        
                        throw new Error("Something went wrong getting group level. Please refresh and retry manually.");
                    }
                }
            }

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
