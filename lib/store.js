const fs = require('fs/promises');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

async function readJsonFile(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function writeJsonFile(fileName, value) {
  const filePath = path.join(DATA_DIR, fileName);
  await fs.writeFile(filePath, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

async function getContent() {
  return readJsonFile('content.json');
}

async function getSubmissions() {
  return readJsonFile('submissions.json');
}

async function saveSubmissions(submissions) {
  return writeJsonFile('submissions.json', submissions);
}

module.exports = {
  getContent,
  getSubmissions,
  saveSubmissions
};
