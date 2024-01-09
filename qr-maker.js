const { createCanvas, loadImage } = require("canvas");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

const folderPath = "./qrcodes";

let fileNames = [];

fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.error("Error reading folder:", err);
    return;
  }
  fileNames = files;
  console.log("files", files);
  console.log(fileNames);
  files.forEach(async (file) => {
    await createImage(file).catch(console.error);
  });
  //   // Iterate over the files in the folder
  //   files.forEach((file) => {
  //     // Get the full path of the file
  //     const filePath = path.join(folderPath, file);

  //     // Use fs.stat to check if it's a file (not a subdirectory)
  //     fs.stat(filePath, (err, stats) => {
  //       if (err) {
  //         console.error("Error getting file stats:", err);
  //         return;
  //       }

  //       if (stats.isFile()) {
  //         // Do something with the file
  //         console.log("File found:", filePath);
  //       }
  //     });
  //   });
});

async function createImage(text) {
  // Load background image
  const bg = await loadImage("images/bg.jpg");
  // Create canvas with the same dimensions as the background image
  const canvas = createCanvas(bg.width, bg.height, "pdf");
  const ctx = canvas.getContext("2d");
  // Draw background image on canvas
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
  // Generate QR code based on input text
  const qrCodeDataUrl = await QRCode.toDataURL(text, { width: 600 });
  const qrCodeImage = await loadImage(`./qrcodes/${text}`);
  // Calculate position to center the QR code image
  const qrCodeX = (canvas.width - qrCodeImage.width) / 2;
  const qrCodeY = (canvas.height - qrCodeImage.height) / 2;
  // Draw QR code image at the center
  ctx.drawImage(
    qrCodeImage,
    300,
    500,
    qrCodeImage.width / 2,
    qrCodeImage.height / 2
  );
  // Add text below the QR code
  const fontSize = 36;
  const textX = canvas.width / 2;
  const textY = -150 + qrCodeImage.height + fontSize + 10; // Add some padding below the QR code
  ctx.font = `${fontSize}px Arial`;
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  const upiId = text?.split(".png")[0];
  ctx.fillText(upiId, textX, textY);
  // Save the result as 'result.jpg'
  const out = fs.createWriteStream(`./output/${upiId}.pdf`);
  const stream = canvas.createPDFStream();
  stream.pipe(out);
  out.on("finish", () => console.log("The image was created successfully."));
}
// Example usage: Generate QR code for the given text and overlay it onto the background image
// const text = "merchantqr.0mcraohp@digikhata"; // Replace this with the desired URL or text
// createImage(text).catch(console.error);
