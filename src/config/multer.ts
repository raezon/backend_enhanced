import multer from "multer";
import path from "path";
import fs from "fs";
import { NextFunction, Request, Response } from "express";

// Create the uploads/documents directory if it doesn't exist
const uploadPath = path.join(process.cwd(), "uploads/documents");
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        // Sanitize filename: remove special characters and spaces
        const sanitizedName = file.originalname
            .replace(ext, "")
            .replace(/[^a-zA-Z0-9]/g, "_")
            .toLowerCase();
        cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
    },
});

// Restrict allowed file types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/msword", // .doc
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    }
};

// Create the multer instance
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB per file
        files: 10, // Max 10 files
    },
});

// Middleware to handle multer errors
export const handleFileUpload = upload.array("documents");

// Error handling wrapper
export const fileUploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
    handleFileUpload(req, res as Response, (err) => {
        if (err) {
            // Handle Multer-specific errors
            if (err instanceof multer.MulterError) {
                let message = "File upload error";

                switch (err.code) {
                    case "LIMIT_FILE_SIZE":
                        message = "File size exceeds 10MB limit";
                        break;
                    case "LIMIT_FILE_COUNT":
                        message = "Maximum 10 files allowed";
                        break;
                    case "LIMIT_UNEXPECTED_FILE":
                        message = "Invalid file type. Allowed: PDF, JPEG, PNG, DOC, DOCX";
                        break;
                }

                return res.status(400).json({
                    error: "FILE_UPLOAD_FAILED",
                    message,
                    code: err.code,
                });
            }
            // Handle other errors
            else {
                console.error("File upload error:", err);
                return res.status(500).json({
                    error: "SERVER_ERROR",
                    message: "Internal server error during file upload",
                });
            }
        }
        next();
    });
};

export default upload;
