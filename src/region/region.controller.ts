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
import { RegionService } from './region.service';
import { RegionFilterDto } from './dto/filter-region.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Role } from 'src/decorators/role.decorators';
import { RoleGuard } from 'src/guards/role.guard';
import { UserRole } from 'src/enums/UserRole';

@Controller('region')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Role(UserRole.ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() body: { name: string }) {
    return this.regionService.create(body.name);
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@Query() regionFilterDto: RegionFilterDto) {
    return this.regionService.findAll(regionFilterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.regionService.findOne(id);
  }

  @Role(UserRole.ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { name: string }) {
    return this.regionService.update(id, body.name);
  }

  @Role(UserRole.ADMIN)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.regionService.remove(id);
  }
}
