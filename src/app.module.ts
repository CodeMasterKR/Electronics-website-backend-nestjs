import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RegionModule } from './region/region.module';
import { AuthModule } from './auth/auth.module';
import { ColorModule } from './color/color.module';

@Module({
  imports: [PrismaModule, AuthModule, RegionModule, ColorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
