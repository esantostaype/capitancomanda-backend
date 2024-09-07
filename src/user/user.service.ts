import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role, User, UserStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid'
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { backendEndUrl, throwUnauthorizedException } from 'src/utils';

@Injectable()
export class UserService {

  constructor(
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
    private prisma: PrismaService
  ) {}

  async findAll( userRole: Role, branchId: string, ownedRestaurantId: string ): Promise<User[]> {
    if ( userRole === Role.OWNER ) {
      return await this.prisma.user.findMany({
        where: {
          branch: { restaurantId: ownedRestaurantId }
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          branch: true
        }
      })
    } else if ( userRole === Role.ADMIN ) {
      return await this.prisma.user.findMany({
        where: {
          branchId,
          role: {
            not: Role.OWNER
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
      })
    } else {
      throwUnauthorizedException()
    }
  }

  async findOneByEmail( email: string ) {
    return this.prisma.user.findUnique({
      where: {
        email
      }
    })
  }

  async findOne( userRole: Role, branchId: string, ownedRestaurantId: string, id: string ) {
    if ( userRole === Role.OWNER ) {
      return await this.prisma.user.findFirst({
        where: {
          id,
          branch: { restaurantId: ownedRestaurantId }
        }
      })
    } else if ( userRole === Role.ADMIN ) {
      return await this.prisma.user.findFirst({
        where: {
          id,
          branchId,
          role: {
            not: Role.OWNER
          }
        }
      })
    } else {
      throwUnauthorizedException()
    }
  }

  async create( userRole: Role, branchId: string, data: User ) {
    if ( userRole === Role.OWNER ) {
      const newUser = await this.prisma.user.create({
        data: {
          ...data,
          password: await bcryptjs.hash( data.password, 6 ),
          verificationToken: uuidv4(),
          status: UserStatus.NOT_VERIFIED
        }
      })

      await this.sendVerificationEmail(newUser.email, newUser.verificationToken);
      return { newUser, message: 'Se debe verificar el correo electrónico para continuar!' };
    } else if ( userRole === Role.ADMIN ) {
      const newUser = await this.prisma.user.create({
        data: {
          ...data,
          branchId,
          password: await bcryptjs.hash( data.password, 6 ),
          verificationToken: uuidv4(),
          status: UserStatus.NOT_VERIFIED
        }
      })

      await this.sendVerificationEmail(newUser.email, newUser.verificationToken);
      return { newUser, message: 'Se debe verificar el correo electrónico para continuar!' };
    } else {
      throwUnauthorizedException()
    }
  }

  async update( userRole: Role, id: string, data: Partial<User> ) {
    if ( userRole === Role.OWNER ) {
      return this.prisma.user.update({
        where: {
          id
        },
        data: {
          ...data,
          tokenVersion: { increment: 1 }
        }
      })
    } else if ( Role.ADMIN ) {
      return this.prisma.user.update({
        where: {
          id,
          role: {
            not: Role.OWNER
          }
        },
        data
      })
    } else {
      throwUnauthorizedException()
    }
  }

  async remove( userRole: Role, branchId: string, id: string ) {
    if ( userRole === Role.OWNER || Role.ADMIN ) {
      return this.prisma.user.delete({
        where: {
          id,
          branchId
        }
      })
    } else {
      throwUnauthorizedException()
    }
  }

  async sendVerificationEmail(email: string, verificationToken: string) {
    const verificationLink = `${ backendEndUrl }/api/users/verify/${verificationToken}`
    await this.mailerService.sendMail({
      to: email,
      subject: 'Verifica tu correo electrónico',
      template: './verification',
      context: {
        verificationLink
      }
    })
  }

  async verifyEmail( verificationToken: string ) {
    const user = await this.prisma.user.findFirst({ where: { verificationToken } });
    if (!user) throw new NotFoundException('Token de verificación no válido');
  
    await this.prisma.user.update({
      where: { id: user.id },
      data: { status: UserStatus.ACTIVE }
    })
  
    const payload = {
      userEmail: user.email,
      userFullName: user.fullName,
      userId: user.id,
      userRole: user.role,
      branchId: user.branchId,
      tokenVersion: user.tokenVersion
    }
  
    const token = await this.jwtService.signAsync( payload )
  
    return { user, token }
  }
}
