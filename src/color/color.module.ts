import { Module } from '@nestjs/common';
import { ColorService } from './color.service';
import { ColorController } from './color.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.ACCESS_KEY,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [ColorController],
  providers: [ColorService],
})
export class ColorModule {}