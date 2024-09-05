import { createCanvas, loadImage } from "canvas";
import { readdir, existsSync, mkdirSync } from "fs";
import { jsPDF } from "jspdf";

const folderPath = "./qrcodes";
const dir = "./output";
const batchSize = 1000; // Process 1000 files at a time

readdir(folderPath, async (err, files) => {
  const startTime = performance.now();

  if (err) {
    console.error("Error reading folder:", err);
    return;
  }
  const bg = await loadImage("images/bg.jpg");
  const totalFiles = files.length;
  let processedFiles = 0;

  // Batch processing loop
  while (processedFiles < totalFiles) {
    const batchFiles = files.slice(processedFiles, processedFiles + batchSize);
    await processBatch(batchFiles, bg);
    processedFiles += batchSize;
  }

  console.log("Folder created successfully");
  const endTime = performance.now();
  const timeTaken = endTime - startTime;
  const minutes = Math.floor((timeTaken / 1000 / 60) << 0);
  const sec = Math.floor((timeTaken / 1000) % 60);

  console.log(`Time taken: ${minutes}:${sec} minutes`);
});

async function processBatch(batchFiles, bg) {
  await Promise.allSettled(
    batchFiles.map(async (file) => {
      if (file.includes(".DS_Store")) return;

      try {
        await createImage(file, bg);
      } catch (error) {
        console.error("Error creating image:", error);
      }
    })
  );
}

async function createImage(text, bg) {
  // Create canvas with the same dimensions as the background image
  const canvas = createCanvas(bg.width, bg.height);
  const ctx = canvas.getContext("2d");
  // Draw background image on canvas
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
  // Generate QR code based on input text
  const qrCodeImage = await loadImage(`${folderPath}/${text}`);
  // Draw QR code image at the center
  ctx.drawImage(
    qrCodeImage,
    100,
    800,
    qrCodeImage.width / 1.2,
    qrCodeImage.height / 1.2
  );
  // Add text below the QR code
  const fontSize = 56;
  const textX = canvas.width / 2;
  const textY = 600 + qrCodeImage.height + fontSize + 10; // Add some padding below the QR code
  ctx.font = `${fontSize}px Arial`;
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  const upiId = text?.split(".png")[0];
  ctx.fillText(upiId, textX, textY);

  const containerWidth = 4.134;
  const containerHeight = 8.256;

  var doc = new jsPDF({
    orientation: "p",
    unit: "in",
    format: [containerWidth, containerHeight],
  });
  var width = doc.internal.pageSize.getWidth();
  var height = doc.internal.pageSize.getHeight();
  doc.addImage(canvas.toDataURL(), "JPEG", 0, 0, width, height, "", "FAST");
  if (!existsSync(dir)) {
    mkdirSync(dir);
  }
  doc.save(`${dir}/${upiId}.pdf`);
}
