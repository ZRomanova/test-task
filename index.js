const fs = require('fs');
const path = require('path');

const readFileStream = path.join(__dirname, 'test.txt');
const bufferSize = 1;
const readStream = fs.createReadStream(readFileStream, { highWaterMark: bufferSize });

const writeFileStream = path.join(__dirname, 'output.txt');
const writeStream = fs.createWriteStream(writeFileStream);

const symbolsCount = {}
let totalSymbols = 0


function isLetter(char) {
  const letterRegex = /^[a-zA-Z]$/;
  return letterRegex.test(char);
}

function sortObjectKeys(object) {
  const ordered = Object.keys(object).sort().reduce(
    (obj, key) => {
      obj[key] = object[key];
      return obj;
    },
    {}
  );
  return ordered
}

function addSymbol(chunk) {
  let symbol = chunk.toString()

  if (symbol in symbolsCount) {
    totalSymbols++
    symbolsCount[symbol]++
  }
  else if (isLetter(symbol)) {
    totalSymbols++
    symbolsCount[symbol] = 1
  }
}

function getFrequencySrting(symbol) {
  return `${symbol} — ${Math.round(symbolsCount[symbol] / totalSymbols * 10000) / 100}%\n`
}


readStream.on('data', addSymbol);

readStream.on('end', () => {
  const sortedSymbols = sortObjectKeys(symbolsCount)

  for (const symbol in sortedSymbols) {
    writeStream.write(getFrequencySrting(symbol), (err) => {
      if (err) {
        console.error('Ошибка при записи: ', err);
      }
    });
  }
});

readStream.on('error', (err) => {
  console.error('Ошибка при чтении файла: ', err);
});
