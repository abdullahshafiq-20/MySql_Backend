import { cloudinaryUploader } from "../utils/cloudinary.js";
import { Readable } from 'stream';

export const imageUpload = async (request, response) => {
    try {
        if (!request.file) {
            throw new Error('No file uploaded');
        }

        // Create a stream from the buffer
        const stream = Readable.from(request.file.buffer);

        // Upload to Cloudinary using stream
        const uploadPromise = new Promise((resolve, reject) => {
            const uploadStream = cloudinaryUploader.upload_stream(
                {
                    folder: 'uploads',
                    resource_type: 'auto'
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            stream.pipe(uploadStream);
        });

        const uploadResult = await uploadPromise;

        response.json({
            data: {
                url: uploadResult.secure_url,
                name: uploadResult.original_filename,
            },
            status: true,
            message: "Image uploaded successfully!"
        });
    } catch (error) {
        response.status(500).json({
            data: [],
            status: false,
            message: error.message,
        });
    }
};