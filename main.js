const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Serve static files from the 'public' directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint to handle file uploads
app.post('/upload', upload.array('pdfs'), (req, res) => {
  const files = req.files;
  const convertedFiles = [];
  const groupName = Date.now().toString();

  files.forEach((file, index) => {
    const inputFilePath = file.path;
    const fileName = index + 1;
    const outputFilePath = path.join(
      __dirname,
      'public',
      groupName,
      `${fileName}.html`
    );

    // Convert PDF to HTML using pdftohtml command
    exec(`pdftohtml ${inputFilePath} ${outputFilePath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error converting file: ${stderr}`);
        return res.status(500).send('Error converting file');
      }

      // Add the link to the converted file
      convertedFiles.push(`/public/${file.filename}.html`);

      // Check if all files have been processed
      if (convertedFiles.length === files.length) {
        res.json({ links: convertedFiles });
      }

      // Clean up the uploaded PDF file
      fs.unlinkSync(inputFilePath);
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
