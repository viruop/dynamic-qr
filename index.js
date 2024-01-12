import { createCanvas, loadImage } from 'canvas';
import { readdir, existsSync, mkdirSync } from 'fs';
import { jsPDF } from 'jspdf';

const folderPath = './qrcodes';
const dir = './output';

readdir(folderPath, async (err, files) => {
	const startTime = performance.now();

	if (err) {
		console.error('Error reading folder:', err);
		return;
	}
	const bg = await loadImage('images/bg.jpeg');
	await Promise.allSettled(
		files.map(async (file) => {
			if (file.includes('.DS_Store')) return;
			await createImage(file, bg).catch(console.error);
		})
	);
	console.log('Folder created successfully');
	const endTime = performance.now();
	const timeTaken = endTime - startTime;
	const minutes = Math.floor((timeTaken / 1000 / 60) << 0);
	const sec = Math.floor((timeTaken / 1000) % 60);

	console.log(`Time taken: ${minutes}:${sec} minutes`);
});

async function createImage(text, bg) {
	// Create canvas with the same dimensions as the background image
	const canvas = createCanvas(bg.width, bg.height);
	const ctx = canvas.getContext('2d');

	// ctx.globalAlpha = 0.3;

	// Draw background image on canvas
	ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
	// Generate QR code based on input text
	const qrCodeImage = await loadImage(`./qrcodes/${text}`);
	// Draw QR code image at the center
	ctx.drawImage(
		qrCodeImage,
		85,
		301,
		qrCodeImage.width / 1.41,
		qrCodeImage.height / 1.4
	);

	// Add text below the QR code
	const fontSize = 32;
	const textX = canvas.width / 2;
	const textY = -120 + qrCodeImage.height + fontSize + 20; // Add some padding below the QR code
	ctx.font = `${fontSize}px Arial`;
	ctx.textAlign = 'center';
	ctx.fillStyle = 'black';
	const upiId = text?.split('.png')[0];
	ctx.fillText(`UPI ID: ${upiId}`, textX, textY);

	const containerWidth = 4.134;
	const containerHeight = 6.024;

	var doc = new jsPDF({
		orientation: 'p',
		unit: 'in',
		format: [containerWidth, containerHeight],
	});
	var width = doc.internal.pageSize.getWidth();
	var height = doc.internal.pageSize.getHeight();
	doc.addImage(canvas.toDataURL(), 'JPEG', 0, 0, width, height, '', 'FAST');
	if (!existsSync(dir)) {
		mkdirSync(dir);
	}
	doc.save(`${dir}/${upiId}.pdf`);
}
