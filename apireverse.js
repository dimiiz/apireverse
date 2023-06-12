const http = require('http');
const axios = require('axios');
const cheerio = require('cheerio');

const INTERVALO_ATUALIZACAO = 10000; // 10s
const PAGINAS = 5;
let tableData = '';
let server = null; // Variável para armazenar o servidor

function fetchData(page) {
  const url = page === 0 ? 'https://ntowar.online/?subtopic=highscores&list=experience/0' : `https://ntowar.online/?subtopic=highscores&list=experience/${page}`;

  axios.get(url)
    .then(response => {
      const html = response.data;
      const $ = cheerio.load(html);

      const tableRows = $('table.content-table tbody tr');
      const formattedCells = [];

      tableRows.each((_, row) => {
        const columns = $(row).find('td');
        const name = $(columns[2]).text().trim();
        const nameArray = name.split('\n');
        const level = $(columns[3]).text().trim();

        formattedCells.push(`${nameArray[0]}:${level}:${nameArray[1]}`);
      });

      const result = formattedCells.join('\n');
      tableData += result;

      if (page === PAGINAS) {
        // Última página, retornar os dados
        if (!server) {
          // Criar o servidor apenas se não existir
          server = http.createServer((req, res) => {
            if (req.url === '/') {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/plain');
              res.end(tableData);
            }
          });

          const port = 3001;
          server.listen(port, () => {
            console.log(`Servidor está rodando em http://localhost:${port}`);
          });
        }
      }
    })
    .catch(error => {
      console.log('Ocorreu um erro:', error);
    });
}

// Atualizar periodicamente os dados
function updateData() {
  // Encerrar o servidor se estiver em execução
  if (server) {
    server.close();
    server = null;
  }

  tableData = ''; // Limpar os dados antigos antes de atualizar
  
  // Tratar a página 0 separadamente
  fetchData(0);

  for (let page = 1; page <= PAGINAS; page++) {
    fetchData(page);
  }
}

updateData(); // Inicialmente buscar os dados

// Atualizar periodicamente os dados
setInterval(updateData, INTERVALO_ATUALIZACAO);
