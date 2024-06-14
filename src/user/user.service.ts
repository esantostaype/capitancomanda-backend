import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, UserStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid'
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class UserService {

  constructor(
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
    private prisma: PrismaService
  ) {}

  findAll( branchId: string ) {
    return this.prisma.user.findMany({
      where: {
        branchId
      },
      orderBy: {
        id: 'asc'
      },
      include: {
        branch: true
      }
    })
  }

  findOneByEmail( email: string ) {
    return this.prisma.user.findUnique({
      where: {
        email
      }
    })
  }

  findOne( branchId: string, id: string ) {
    return this.prisma.user.findUnique({
      where: {
        branchId,
        id
      }
    })
  }

  async create( branchId: string, data: User ) {
    const newUser = await this.prisma.user.create({
      data: {
        ...data,
        password: await bcryptjs.hash( data.password, 6 ),
        verificationToken: uuidv4(),
        status: UserStatus.NOT_VERIFIED,
        branchId
      }
    })

    await this.sendVerificationEmail(newUser.email, newUser.verificationToken);
    return { newUser, message: 'Por favor, verifica tu correo electrónico para continuar!' };
  }

  update( branchId: string, id: string, data: User ) {
    return this.prisma.user.update({
      where: {
        branchId,
        id
      },
      data
    })
  }

  remove( branchId: string, id: string ) {
    return this.prisma.user.delete({
      where: {
        branchId,
        id
      }
    })
  }

  async sendVerificationEmail(email: string, verificationToken: string) {
    const verificationLink = `http://localhost:3001/api/users/verify/${verificationToken}`
    await this.mailerService.sendMail({
      to: email,
      subject: 'Verifica tu correo electrónico',
      template: './verification',
      context: {
        verificationLink
      }
    })
  }

  async verifyEmail(verificationToken: string) {
    const user = await this.prisma.user.findFirst({ where: { verificationToken } });
    if (!user) throw new NotFoundException('Token de verificación no válido');
  
    await this.prisma.user.update({
      where: { id: user.id },
      data: { status: UserStatus.ACTIVE },
    });
  
    const payload = {
      userEmail: user.email,
      userRole: user.role,
      branchId: user.branchId
    };
  
    const token = await this.jwtService.signAsync(payload);
  
    return { user, token };
  }
}
