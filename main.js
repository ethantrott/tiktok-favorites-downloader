const Tiktok = require("@tobyg74/tiktok-api-dl")
const { http, https } = require('follow-redirects');
const fs = require('fs');
var request = require('request');
var sleep = require('system-sleep');

const tiktokData = require("./user_data_tiktok.json");

var finished = [];
var unavailable = [];

function downloadLink(link, num) {
    console.log(num);
    console.log(link);

    const file = fs.createWriteStream("videos/" + num + ".mp4");
    const request = https.get(link, function (response) {
        response.pipe(file);

        // after download completed close filestream
        file.on("finish", () => {
            file.close();
            console.log("Download Completed");
            finished.push(num);
        });
    });
}

const favorites = tiktokData["Activity"]["Favorite Videos"]["FavoriteVideoList"];
for (const vid in favorites) {
    if (!fs.existsSync("./videos/"+vid+".mp4")){
        sleep(5000);
    const link = favorites[vid]["Link"];
    console.log("before: " + link);
    var goodLink = request.get(link, function (err, res, body) {
        console.log("after: "+goodLink.uri.href)
        Tiktok.Downloader(goodLink.uri.href, {
            version: "v3",
        }).then((result) => {
            console.log(result);
            if (!(result.status === "error")) {
                console.log("continuing to download")
                downloadLink(result.result.videoHD, vid);
            }else{
                unavailable.push(vid);
            }
        }).catch((e) => {
            console.log(e);
        });
    });
    }else{
        console.log("File already exists. Skipping..");
    }
}

console.log("Finished:");
console.log(finished);

console.log("Unavailable/Failed:");
console.log(unavailable);
