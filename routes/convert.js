import express from "express";
import multer from "multer";
import mammoth from "mammoth";
import { PDFDocument, StandardFonts } from "pdf-lib";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // DOCX → TEXT
    const { value } = await mammoth.extractRawText({
      buffer: req.file.buffer,
    });

    // CREATE PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const { width, height } = page.getSize();
    const fontSize = 12;

    page.drawText(value || "Empty document", {
      x: 50,
      y: height - 50,
      size: fontSize,
      font,
      maxWidth: width - 100,
      lineHeight: 14,
    });

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=converted.pdf"
    );

    return res.status(200).send(Buffer.from(pdfBytes));

  } catch (err) {
    console.error("PDF error:", err);
    return res.status(500).json({ message: "PDF conversion failed" });
  }
});

export default router;
