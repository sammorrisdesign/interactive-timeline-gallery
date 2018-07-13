var request = require('sync-request');
var fs = require('fs-extra');
var gsjson = require('google-spreadsheet-to-json');
var deasync = require('deasync');
var config = require('../config.json');
var userHome = require('user-home');
var keys = require(userHome + '/.gu/interactives.json');

var json,
    data = {regions: {}},
    conferences = [];

function fetchData(callback) {
    gsjson({
        spreadsheetId: config.data.id,
        allWorksheets: true,
        credentials: keys.google
    })
    .then(function(result) {
        callback(result);
    })
    .then(function(err) {
        if (err) {
            console.log(err);
        }
    });
}

function setSheetNames(data) {
    data = {
        'slides': data[0]
    }

    return data;
}

function cleanMedia(data) {
    for (var i in data.slides) {
        var url = data.slides[i].media;
        if (url) {
            var crop = url.split('?crop=')[1];
                url = url.replace('gutools.co.uk', 'guim.co.uk');
                url = url.replace('http://', 'https://');
                url = url.replace('images/', '');
                url = url.split('?')[0];

            data.slides[i].media = url + '/' + crop + '/1000.jpg';
        }
    }

    return data;
}

module.exports = function getData() {
    var isDone = false;

    fetchData(function(result) {
        data = result;
        data = setSheetNames(data);
        data = cleanMedia(data);

        isDone = true;
    });

    deasync.loopWhile(function() {
        return !isDone;
    });

    return data;
};