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

    // HTML → PDF
    const pdfBuffer = await pdf.generatePdf(
      { content: html },
      { format: "A4" }
    );

    // 🔑 THESE HEADERS ARE CRITICAL
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=converted.pdf"
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    return res.end(pdfBuffer); // 🔥 IMPORTANT: res.end, not res.send
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "PDF conversion failed" });
  }
});

export default router;
