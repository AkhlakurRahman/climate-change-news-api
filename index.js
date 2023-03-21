const PORT = 8000;
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const { newsPapers } = require('./constants.js');

const app = express();

let articles = [];

const scrapeNewsPapers = async (newsPaper) => {
    const response = await axios.get(newsPaper.address);

    const html = response?.data;
    const $ = cheerio.load(html);

    const newsData = [];

    $('a:contains("climate")', html).each(function () {
        const title = $(this).text().trim();
        const url = $(this).attr('href');

        newsData.push({
            title,
            url: newsPaper.base + url,
            source: newsPaper.name,
        });
    });

    return newsData;
};

newsPapers.forEach(async (newsPaper) => {
    const scrapedArticle = await scrapeNewsPapers(newsPaper);

    articles = [...articles, ...scrapedArticle];
});

app.get('/', (req, res) => res.json('Welcomengds'));

app.get('/news', (req, res) => {
    res.json(articles);
});

app.get('/news/:newsPaper', async (req, res) => {
    const newsPaperName = req.params.newsPaper;

    const specificNewsPaper = newsPapers.filter(
        (newsPaper) => newsPaper.name === newsPaperName
    )[0];

    const scrapedArticle = await scrapeNewsPapers(specificNewsPaper);

    res.json(scrapedArticle);
});

app.listen(PORT, () =>
    console.log('listening on port: ' + PORT + '/ http://localhost:' + PORT)
);
