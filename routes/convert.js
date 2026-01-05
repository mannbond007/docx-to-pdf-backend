import express from "express";
import multer from "multer";
import mammoth from "mammoth";
import pdf from "html-pdf-node";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // DOCX → HTML
    const { value: html } = await mammoth.convertToHtml({
      buffer: req.file.buffer
    });

    // HTML → PDF (FORCE BUFFER OUTPUT)
    const pdfBuffer = await pdf.generatePdf(
      { content: html },
      {
        format: "A4",
        printBackground: true
      }
    );

    // ✅ CRITICAL HEADERS
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=converted.pdf"
    );

    // ✅ SEND AS PURE BINARY
    return res.status(200).send(Buffer.from(pdfBuffer));

  } catch (err) {
    console.error("PDF conversion error:", err);
    return res.status(500).json({ message: "PDF conversion failed" });
  }
});

export default router;
