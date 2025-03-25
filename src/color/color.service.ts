import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ColorFilterDto } from './dto/filter-color.dto';

@Injectable()
export class ColorService {
  constructor(private prisma: PrismaService) {}

  async create(colorName: string) {
    const isExist = await this.prisma.color.findFirst({
      where: {
        colorName,
      },
    });
    if (isExist) {
      throw new BadRequestException('Color already exists with this name!');
    }

    const newColor = await this.prisma.color.create({
      data: { colorName },
      include: { ColorItem: true }, // Including related ColorItems
    });

    return newColor;
  }

  async findAll(colorFilterDto: ColorFilterDto) {
    let { colorName, page, limit, order, sortBy } = colorFilterDto;

    page = page || 1;
    limit = limit || 10;
    const offset = (page - 1) * limit;

    const allowedSortFields = ['colorName', 'createdAt'];
    sortBy = allowedSortFields.includes(sortBy || '') ? sortBy : 'createdAt';

    const colors = await this.prisma.color.findMany({
      where: {
        colorName: colorName ? { contains: colorName, mode: 'insensitive' } : undefined,
      },
      orderBy: {
        [sortBy || 'createdAt']: order == 'desc' ? 'desc' : 'asc',
      },
      take: limit,
      skip: offset,
      include: { ColorItem: true },
    });

    const total = await this.prisma.color.count({
      where: {
        colorName: colorName ? { contains: colorName, mode: 'insensitive' } : undefined,
      },
    });

    return { data: colors, total, page, limit };
  }

  async findOne(id: string) {
    const color = await this.prisma.color.findUnique({
      where: { id },
      include: { ColorItem: true }, 
    });

    if (!color) {
      throw new BadRequestException('Color not found with this id!');
    }
    return color;
  }

  async update(id: string, colorName: string) {
    const color = await this.prisma.color.findUnique({
      where: { id },
    });

    if (!color) {
      throw new BadRequestException('Color not found with this id!');
    }

    const updated = await this.prisma.color.update({
      where: { id },
      data: { colorName },
      include: { ColorItem: true }, // Including related ColorItems
    });

    return updated;
  }

  async remove(id: string) {
    const color = await this.prisma.color.findUnique({
      where: { id },
    });

    if (!color) {
      throw new BadRequestException('Color not found with this id!');
    }

    await this.prisma.color.delete({
      where: { id },
    });

    return 'Color was deleted successfully!';
  }
}