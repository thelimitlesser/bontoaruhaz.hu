const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('/Users/erdelyipeter/.gemini/antigravity/brain/c96711a6-8545-4ff3-914d-40cacbb16285/.tempmediaStorage/9532225bd2a5a3f7.pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('pxp_api_parsed.txt', data.text);
    console.log("PDF parsed to pxp_api_parsed.txt");
});
