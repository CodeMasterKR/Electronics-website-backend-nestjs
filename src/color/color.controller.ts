import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { ColorService } from './color.service';
import { ColorFilterDto } from './dto/filter-color.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Role } from 'src/decorators/role.decorators';
import { RoleGuard } from 'src/guards/role.guard';
import { UserRole } from 'src/enums/UserRole';

@Controller('color')
export class ColorController {
  constructor(private readonly colorService: ColorService) {}

  @Role(UserRole.ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() body: { colorName: string }) {
    return this.colorService.create(body.colorName);
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@Query() colorFilterDto: ColorFilterDto) {
    return this.colorService.findAll(colorFilterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.colorService.findOne(id);
  }

  @Role(UserRole.ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { colorName: string }) {
    return this.colorService.update(id, body.colorName);
  }

  @Role(UserRole.ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.colorService.remove(id);
  }
}