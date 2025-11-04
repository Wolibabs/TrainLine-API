const QRCode = require("qrcode");

const generateBarcode = async (text) => {
  try {
    const qr = await QRCode.toDataURL(text);
    return qr;
  } catch (error) {
    console.error("QR generation error:", error);
    throw new Error("Failed to generate barcode");
  }
};

module.exports = generateBarcode;
