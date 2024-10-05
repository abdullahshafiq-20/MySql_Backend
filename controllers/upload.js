import { cloudinaryUploader } from "../utils/cloudinary.js";
import busboy from "busboy";

export const imageUpload = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const bb = busboy({ headers: req.headers });

  bb.on('file', (name, file, info) => {
    const { filename, encoding, mimeType } = info;

    const cloudinaryStream = cloudinaryUploader.upload_stream(
      {
        folder: "your_folder_name", // Optional: specify a folder in Cloudinary
        resource_type: "auto" // Automatically detect the file type
      },
      (error, result) => {
        if (error) {
          console.error('Upload to Cloudinary failed:', error);
          res.status(500).json({ error: 'Upload to Cloudinary failed' });
        } else {
          res.json({
            data: {
              url: result.secure_url,
              name: result.original_filename,
            },
            status: true,
            message: "Image uploaded successfully!"
          });
        }
      }
    );

    file.pipe(cloudinaryStream);
  });

  bb.on('error', (error) => {
    console.error('Error processing form:', error);
    res.status(500).json({ error: 'Error processing form' });
  });

  req.pipe(bb);
};

// Usage in your router:
// router.post("/imageupload", imageUpload);