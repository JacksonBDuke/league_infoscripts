const request = require('request');
const cheerio = require('cheerio');
const factory = require('./utils/factory');
const champion = require('./models/champion');

const rootUrl = 'http://leagueoflegends.wikia.com';
const landingPageSuffix = '/wiki/League_of_Legends_Wiki'

doAll();
// justAkali();

function justAkali() {
    let akali = new champion.ChampNameExtension();
    akali.name = 'Syndra';
    akali.extension = '/wiki/Syndra';

    getAbilitiesVerbosity(akali, function(newAkali) {
        let verbosity = 0;
        akali = newAkali;
        console.log(akali);
    });
}

function doAll() {
    getBaseChampObjects(function(champions) {
        getAllChampions(champions, function(baseChampions) {
            sortAllChampionsByVerbosity(baseChampions, function(sortedChampions) {
                printChampions(sortedChampions);
            })
        })
    })
}

function getAllChampions(champions, cb) {
    let count = 1;
    champions.forEach((champ) => {
        getAbilitiesVerbosity(champ, function(newChamp) {
            champ = newChamp
            ++count;
            if(count >= champions.length) cb(champions);
        });
    });
}

function sortAllChampionsByVerbosity(champions, cb) {
    cb(champions.sort(function(a, b) {return a.verbosity - b.verbosity}));
}

function printChampions(champions) {
    champions.forEach((champion) => {
        console.log(`${champion.name}:\t${champion.verbosity}`);
    }) 
}

function getAbilitiesVerbosity(champ, cb) {
    let options = factory.getOptions(rootUrl + champ.extension + '/Abilities?action=render');
    // console.log(options.url);
    request(options, function(err, resp, body) {
        if(err) console.error(`error_${champ}: ${err}`);
        // console.log('statusCode: ', resp && resp.statusCode);
        let abilities = [];
        let verbosity = 0;
        if(resp && resp.statusCode === 200) {
            parseAbilitiesFromHtml(body, function(abs) {
                abilities = abs;
            });
        }
        if(abilities) {
            abilities.forEach((ability) => {
                verbosity += ability.length;
            })
        }
        champ.abilities = abilities;
        champ.verbosity = verbosity;
        // console.log(`${champ.name}:\t${champ.verbosity}`);
        cb(champ);
    });
}

function parseAbilitiesFromHtml(html, cb) {
    const abilities = [];
    const TO_FIND = [`innate`, `q`, `w`, `e`, `r`];

    let $ = cheerio.load(html);
    TO_FIND.forEach((element) => {
        let ability = '';
        $(`div.skill.skill_${element}`).find('p').each(function (i, item) {
            ability += $(item).text();
        });
        return abilities.push(ability.replace(/ *\<[^\>]*\> */g, ""));
    });
    // console.log(abilities);
    cb(abilities);
}


function getBaseChampObjects(cb) {
    let options = factory.getOptions(rootUrl+landingPageSuffix);
    request(options, function(err, resp, body) {
        if(err) console.error('error: ', err);
        // console.log('statusCode: ', resp && resp.statusCode);
        const champions = [];
        let $ = cheerio.load(body);
        $('ol.champion_roster').children().each(function(i, element) {
            let champ = new champion.Champion();
            champ.extension = $(this).find('a').attr('href');
            champ.name = $(this).find('span').attr('data-champion');
            champions[i] = champ;
        });

        cb(champions);
    });
}
