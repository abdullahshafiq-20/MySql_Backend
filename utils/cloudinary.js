import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv';
dotenv.config();

// Configure Cloudinary with extended timeout and chunking
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
    timeout: 180000, // 3 minutes timeout
    chunk_size: 6000000 // 6MB chunks for better upload handling
});

// Export the cloudinary uploader for backward compatibility
export const cloudinaryUploader = cloudinary.uploader;
export const cloudinaryConfig = () => cloudinary.config;

export const uploadToCloudinary = async (file, folder = 'default') => {
    try {
        // Check if file exists and has the required properties
        if (!file || !file.buffer) {
            throw new Error('Invalid file format');
        }

        // Check file size
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            throw new Error('File size exceeds 10MB limit');
        }

        return new Promise((resolve, reject) => {
            const uploadOptions = {
                folder: folder,
                resource_type: 'auto',
                timeout: 180000,
                allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
                max_bytes: 10485760,
                quality: 'auto:good', // Optimize image quality
                fetch_format: 'auto', // Auto-select best format
                flags: 'attachment', // Ensure file is treated as attachment
                overwrite: true, // Overwrite existing files
                use_filename: true, // Use original filename
                unique_filename: true, // Ensure unique names
                async: true // Enable async upload
            };

            let attempts = 0;
            const maxAttempts = 3;

            const attemptUpload = () => {
                attempts++;
                console.log(`Upload attempt ${attempts} for file`);

                const uploadStream = cloudinary.uploader.upload_stream(
                    uploadOptions,
                    (error, result) => {
                        if (error) {
                            console.error('Upload error:', {
                                attempt: attempts,
                                error: error.message,
                                code: error.http_code
                            });

                            if (attempts < maxAttempts && error.http_code === 499) {
                                console.log('Retrying upload...');
                                setTimeout(attemptUpload, 2000 * attempts); // Exponential backoff
                            } else {
                                reject(new Error(`Upload failed after ${attempts} attempts: ${error.message}`));
                            }
                        } else {
                            console.log('Upload successful on attempt', attempts);
                            resolve({
                                url: result.secure_url,
                                public_id: result.public_id,
                                format: result.format,
                                size: result.bytes
                            });
                        }
                    }
                );

                // Handle stream errors
                uploadStream.on('error', (error) => {
                    console.error('Stream error on attempt', attempts, error);
                    if (attempts < maxAttempts) {
                        setTimeout(attemptUpload, 2000 * attempts);
                    } else {
                        reject(new Error('Stream processing failed after multiple attempts'));
                    }
                });

                try {
                    // Upload in chunks if file is large
                    const chunkSize = 6000000; // 6MB chunks
                    const buffer = file.buffer;
                    let offset = 0;

                    const uploadChunk = () => {
                        if (offset < buffer.length) {
                            const chunk = buffer.slice(offset, offset + chunkSize);
                            uploadStream.write(chunk);
                            offset += chunkSize;
                            setTimeout(uploadChunk, 100); // Add small delay between chunks
                        } else {
                            uploadStream.end();
                        }
                    };

                    uploadChunk();
                } catch (streamError) {
                    console.error('Buffer processing error:', streamError);
                    reject(new Error('Failed to process file buffer'));
                }
            };

            attemptUpload();
        });
    } catch (error) {
        console.error('Upload to Cloudinary failed:', {
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
};

export const deleteFromCloudinary = async (public_id) => {
    try {
        if (!public_id) {
            throw new Error('Public ID is required for deletion');
        }

        const result = await cloudinary.uploader.destroy(public_id, {
            timeout: 60000,
            invalidate: true
        });

        if (result.result !== 'ok') {
            throw new Error(`Failed to delete image: ${result.result}`);
        }

        return result;
    } catch (error) {
        console.error('Delete from Cloudinary failed:', {
            error: error.message,
            public_id
        });
        throw new Error(`Delete failed: ${error.message}`);
    }
};

// Utility function to validate environment variables
const validateConfig = () => {
    const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_SECRET_KEY'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required Cloudinary configuration: ${missing.join(', ')}`);
    }
};

// Validate configuration on module load
try {
    validateConfig();
} catch (error) {
    console.error('Cloudinary configuration error:', error.message);
}

export default {
    uploadToCloudinary,
    deleteFromCloudinary,
    cloudinary,
    cloudinaryUploader: cloudinary.uploader,
    cloudinaryConfig: () => cloudinary.config
};