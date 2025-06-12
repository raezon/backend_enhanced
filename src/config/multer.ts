import multer from "multer";
import path from "path";
import fs from "fs";
import { NextFunction, Request, Response } from "express";
import { RequestWithAuth } from "@/core/app/base/types";

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

// Restrict allowed file types (EXPANDED FOR PNG/JPEG)
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = [
        // PDF Types
        "application/pdf",
        "application/x-pdf",
        "application/acrobat",
        "applications/vnd.pdf",
        "text/pdf",
        "text/x-pdf",

        // PNG Types
        "image/png",
        "image/x-png",
        "application/png",
        "application/x-png",

        // JPEG Types
        "image/jpeg",
        "image/pjpeg",
        "image/jpg",
        "image/jpe",
        "image/jpeg;base64",
        "image/jpg;base64",
        "image/pjpeg;base64",

        // DOC/DOCX Types
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-word",
        "application/octet-stream", // For docx files from some clients
        "application/zip", // Some systems identify docx as zip
    ];

    // Debugging: Log all incoming files
    console.log(`[File Upload] Received: ${file.originalname}, Type: ${file.mimetype}`);

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        console.warn(
            `[File Upload] Rejected: ${file.originalname}, Unsupported Type: ${file.mimetype}`
        );
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
    const { id } = (req as RequestWithAuth).user;

    handleFileUpload(req, res as Response, (err) => {
        if (err) {
            // Handle Multer-specific errors
            if (err instanceof multer.MulterError) {
                let message = "File upload error";
                let clientMessage = "File upload failed";

                switch (err.code) {
                    case "LIMIT_FILE_SIZE":
                        message = "File size exceeds 10MB limit";
                        clientMessage = message;
                        break;
                    case "LIMIT_FILE_COUNT":
                        message = "Maximum 10 files allowed";
                        clientMessage = message;
                        break;
                    case "LIMIT_UNEXPECTED_FILE":
                        message = `Invalid file type: ${req.files?.length ? req.files[0].mimetype : "unknown"}. Allowed: PDF, JPEG, PNG, DOC, DOCX`;
                        clientMessage = "Invalid file type. Allowed: PDF, JPEG, PNG, DOC, DOCX";
                        break;
                }

                console.error(`[File Upload Error] ${message}`);
                return res.status(400).json({
                    error: "FILE_UPLOAD_FAILED",
                    message: clientMessage,
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

        // Log successful uploads
        if (req.files?.length) {
            console.log(`[File Upload] Success: ${req.files.length} files uploaded`);
            (req.files as Express.Multer.File[]).forEach((file) => {
                console.log(`  - ${file.originalname} => ${file.filename}`);
            });
        }

        next();
    });
};

export default upload;
