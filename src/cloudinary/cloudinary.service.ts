import { Injectable, BadRequestException } from '@nestjs/common';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

@Injectable()
export class CloudinaryService {

  async uploadImage(file: any): Promise<any> {
    if (!file || !file.name) {
      throw new BadRequestException('No image file provided.');
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filePath = path.join(process.cwd(), 'public', file.name);
    await writeFile(filePath, buffer);

    try {
      const response = await cloudinary.uploader.upload(filePath);

      // Clean up the local file
      await unlink(filePath);

      return {
        message: 'Image uploaded successfully',
        url: response.secure_url,
      };
    } catch (error) {
      // Clean up the local file in case of upload error
      await unlink(filePath);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }
}
