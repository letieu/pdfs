const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const cheerio = require("cheerio");

const app = express();
const port = 3000;

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Serve static files from the 'public' directory
app.use("/public", express.static(path.join(__dirname, "public")));

// Endpoint to handle file uploads
app.post("/upload", upload.array("pdfs"), (req, res) => {
  const files = req.files;

  const htmlFiles = [];

  const groupName = Date.now().toString();

  // Create a directory to store the converted files
  fs.mkdirSync(path.join(__dirname, "public", "output", groupName));

  files.forEach((file, index) => {
    const inputFilePath = file.path;
    const fileName = file.originalname.replace(".pdf", "_") + index + 1;

    const outputFilePath = path.join(
      __dirname,
      "public",
      "output",
      groupName,
      `${fileName}.html`,
    );

    // Convert PDF to HTML using pdftohtml command
    exec(
      `pdftohtml -noframes ${inputFilePath} ${outputFilePath}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error converting file: ${stderr}`);
          return res.status(500).send("Error converting file");
        }

        // Add the link to the converted file
        htmlFiles.push(`/public/output/${groupName}/${fileName}.html`);

        // Check if all files have been processed
        if (htmlFiles.length === files.length) {
          addLinkToHtml(htmlFiles);
          res.json({ links: htmlFiles });
        }

        // Clean up the uploaded PDF file
        fs.unlinkSync(inputFilePath);
      },
    );
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

function addLinkToHtml(links) {
  links.forEach((link) => {
    const filePath = path.join(__dirname, link.slice(1));
    const html = fs.readFileSync(filePath, "utf8");

    const $ = cheerio.load(html);

    $("body").attr("bgcolor", "white");

    links
      .filter((l) => l !== link)
      .forEach((link) => {
      $("body").append(`<a href="${link}">${link}</a><br>`);
    });

    fs.writeFileSync(filePath, $.html());
  });
}
