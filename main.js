const request = require('request');
const cheerio = require('cheerio');
const factory = require('./utils/factory');

const rootUrl = 'http://leagueoflegends.wikia.com';
const landingPageSuffix = '/wiki/League_of_Legends_Wiki'

const champList = [];

// getChampExtensions(function(champ_extensions) {
//     champ_extensions.each((champ) => {
//         getAbilities(champ, function(abilities) {
//             //
//         });
//     })
// })

getAbilities('/wiki/Akali', function(abilities) {
    console.log(abilities);
});

function getAbilities(champ, cb) {
    let options = factory.getOptions(rootUrl + champ + '/Abilities?action=render');
    console.log(options.url);
    request(options, function(err, resp, body) {
        if(err) console.error(`error_${champ}: ${err}`);
        console.log('statusCode: ', resp && resp.statusCode);
        const abilities = [];
        if(resp && resp.statusCode === 200) {
            let $ = cheerio.load(body);
            console.log($('div.skill.skill_innate').find('p').text().replace(/ *\<[^)]*\> */g, ""));
            console.log($('div.skill.skill_q').find('p').text().replace(/ *\<[^)]*\> */g, ""));
            console.log($('div.skill.skill_w').find('p').text().replace(/ *\<[^)]*\> */g, ""));
            console.log($('div.skill.skill_e').find('p').text().replace(/ *\<[^)]*\> */g, ""));
            console.log($('div.skill.skill_r').find('p').text().replace(/ *\<[^)]*\> */g, ""));
            // $('#flytabs_0-content-wrapper').find('tbody').children().each(function(i, element) {
            //     abilities[i] = $(this).find('tr').text();
            //     console.log(abilityes[i]);
            // });
        }
        cb(abilities);
    });
}


function getChampExtensions(cb) {
    let options = factory.getOptions(rootUrl+landingPageSuffix);
    request(options, function(err, resp, body) {
        if(err) console.error('error: ', err);
        console.log('statusCode: ', resp && resp.statusCode);
        const champion_extensions = [];
        let $ = cheerio.load(body);
        $('ol.champion_roster').children().each(function(i, element) {
            champion_extensions[i] = $(this).find('a').attr('href');
        });

        cb(champion_extensions);
    });
}
