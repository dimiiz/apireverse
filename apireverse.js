const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  axios.get('https://dboabridged.online/?highscores')
    .then(response => {
      const $ = cheerio.load(response.data);
      const users = [];

      $('#box3 > div > center:nth-child(4) > table > tbody > tr > td:nth-child(2) > table:nth-child(4) > tbody tr').each((index, element) => {
        if (index < 3) {
          const columns = $(element).find('td');
          const user = $(columns[2]).text().trim();
          const level = $(columns[3]).text().trim();
          users.push(`${user}:${level}`);
        }
      });

      res.send(users.join('\n'));
    })
    .catch(error => {
      console.log(error);
      res.send('Ocorreu um erro ao acessar o site.');
    });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
