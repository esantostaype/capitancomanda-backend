import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

@Controller('cloudinary')
export class CloudinaryController {

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post()
  async create(@Body() request: any) {
    try {
      const data = await request.formData();
      const image = data.get('image');
      const result = await this.cloudinaryService.uploadImage(image);

      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}