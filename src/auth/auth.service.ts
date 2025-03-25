import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register-dto';
import { LoginDto } from './dto/login-dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hashSync } from 'bcrypt';
import * as bcrypt from 'bcrypt';
import { totp } from 'otplib';
import * as DeviseDetector from 'device-detector-js';
import { MailService } from 'src/services/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { ActivateDto } from './dto/activate-dto';
import { Request } from 'express';

@Injectable()
export class AuthService {
  private readonly deviceDetector = new DeviseDetector();
  private otpKEY = process.env.OTP_KEY;
  private refreshKEY = process.env.REFRESH_KEY;
  private accessKEY = process.env.ACCESS_KEY;
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    let { email, phone, regionId, password } = registerDto;
    try {
      const isExistEmail = await this.prisma.user.findFirst({
        where: { email },
      });

      if (isExistEmail) {
        throw new BadRequestException('This email is already in use!');
      }

      const isExistPhone = await this.prisma.user.findFirst({
        where: { phone },
      });

      if (isExistPhone) {
        throw new BadRequestException('This phone is already in use!');
      }
      const isExistRegion = await this.prisma.region.findFirst({
        where: { id: regionId },
      });

      if (!isExistRegion) {
        throw new BadRequestException('Not found region with this id!');
      }

      const hashed = hashSync(password, 10);

      await this.prisma.user.create({
        data: {
          ...registerDto,
          password: hashed,
        },
      });

      totp.options = { step: 300, digits: 6 };

      let otp = totp.generate(this.otpKEY + email);

      await this.mailService.sendMail(
        email,
        'This is password',
        `your password: ${otp}`,
      );

      return 'Success! A verification email has been sent to you. Please activate your account';
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async activate(activateDto: ActivateDto) {
    let { email, otp } = activateDto;
    try {
      const isCorrect = totp.check(otp, this.otpKEY + email);
      if (!isCorrect) {
        throw new BadRequestException('Email or password is wrong!');
      }

      let user = await this.prisma.user.findFirst({
        where: { email },
      });

      if (!user) {
        throw new UnauthorizedException();
      }

      let activeUser = await this.prisma.user.updateMany({
        where: { email },
        data: { status: 'ACTIVE' },
      });

      return { data: 'Account was activated.', activeUser };
    } catch (error) {}
  }

  async login(loginDto: LoginDto, req: Request) {
    let { email, password } = loginDto;
    try {
      const user = await this.prisma.user.findFirst({
        where: {email}
      })
      if(!user) {
        throw new BadRequestException("Not found user with this account");
      }

      let isCorrect = bcrypt.compareSync(password, user.password)
      if(!isCorrect){
        throw new BadRequestException("Email or password is wrong!")
      }

      if(user.status == "INACTIVE") {
        throw new BadRequestException("Your account is not active!")
      };

      
      
      let session = await this.prisma.sessions.findFirst({
        where: {userId: user.id, ipAddress: req.ip},
      })

      if(!session) {
        let userAgent: any = req.headers['user-agent'];
        let device: any = this.deviceDetector.parse(userAgent)
        
        let newSession: any = {
          ipAddress: req.ip,
          userId: user.id,
          location: req.body.location || null,
          deviceInfo: device || 'Unknown Device'
        }

        // await this.prisma.sessions.create({
        //   data: newSession
        // })

        let refreshToken = this.genRefreshToken({
          id: user.id,
          role: user.role,
          status: user.status,
        });
  
        let accessToken = this.genAccessToken({
          id: user.id,
          role: user.role,
          status: user.status,
        });

        return { refreshToken, accessToken, user};
      }
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  genRefreshToken(payload: object) {
    return this.jwtService.sign(payload, {
      secret: this.refreshKEY,
      expiresIn: '30d',
    });
  }

  genAccessToken(payload: object) {
    return this.jwtService.sign(payload, {
      secret: this.accessKEY,
      expiresIn: '1h',
    });
  }
}
