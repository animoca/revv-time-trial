import logger from "winston";
const csv = require('csvtojson');

const loadWords = async () => {
    const fileList = [
        'de.txt',
        'en.txt',
        'es.txt',
        'fr.txt',
        'it.txt',
        'ja.txt',
        'ko.txt',
        'nl.txt',
        'pt.txt',
        'ru.txt',
        'zh.txt'
    ];
    let words = [];
    var excludeList = ['ja.txt','ko.txt','zh.txt', 'ru.txt'];
    for (let i in fileList) {
        let entries = await csv({noheader:true}).fromFile(`${__dirname}/badwords/` + fileList[i]);
        for (let line in entries) {
            var obj = { file: fileList[i], lineNo: parseInt(line) + 1, regex : entries[line].field1};
            if(!excludeList.includes(obj.file) && obj.regex.length <= 2) {
                logger.info(`Not Loading Badword filter ${obj.file} ${obj.regex} character length too short`);
            } else {
                words.push(obj);
            }
        }
    }
    return words;
};

const wordList = loadWords();

const check = async (name) => {
    //console.log(await wordList);
    let regexList = await wordList;
    for(let i = 0; i<regexList.length; i++) {
        var entry = regexList[i]
        if( name.toString().match( entry.regex ) ) {
            logger.warn(`Badword matched , ${entry.file}, ${entry.lineNo}`);
            return true;
        }
    }
    return false;
};

module.exports = {
    check: check
};
