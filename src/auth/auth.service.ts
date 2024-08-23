import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { Role, UserStatus, User } from '@prisma/client'
import { UserService } from 'src/user/user.service'
import { JwtService } from '@nestjs/jwt'
import * as bcryptjs from 'bcryptjs'
import { PrismaService } from 'src/prisma/prisma.service'
import { v4 as uuidv4 } from 'uuid'
import { MailerService } from '@nestjs-modules/mailer'
import { CompleteRegistrationDto, GoogleResitrationDto, RegisterOwnerDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private prisma: PrismaService
  ){}

  private async generateToken( user: User, expiresIn: string ) {
    const payload = {
      userEmail: user.email,
      userFullName: user.fullName,
      userId: user.id,
      userRole: user.role,
      branchId: user.branchId,
      ownedRestaurantId: user.ownedRestaurantId
    }
    return this.jwtService.signAsync( payload, { expiresIn })
  }

  async login({ email, password, rememberMe } : LoginDto) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException("El correo electrónico aun no está registrado");
    }
    if (user.status === UserStatus.NOT_VERIFIED && user.oauth === false) {
      throw new UnauthorizedException("Ya estás registrado. Por favor, confirma tu correo electrónico en tu bandeja de entrada");
    }
    if (user.oauth === true && !user.password) {
      throw new UnauthorizedException("Por favor, completa tu registro");
    }
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("La Contraseña es incorrecta");
    }
    const expiresIn = rememberMe ? '30d' : '1h';
    const token = await this.generateToken(user, expiresIn);
    
    if ( user ) {
      const role = user.role
      return { email, role, token }
    }
  }

  async registerOwner(data: RegisterOwnerDto) {
    const user = await this.userService.findOneByEmail(data.email);
    if ( user ) {
      if ( user.status === UserStatus.ACTIVE ) {
        const token = await this.generateToken( user, '30d');
        return { user, token };
      } else {
        return {
          user,
          message: "Ya estás registrado. Por favor, confirma tu correo electrónico en tu bandeja de entrada"
        }
      }
    }

    const newUser = await this.prisma.user.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        role: Role.OWNER,
        verificationToken: uuidv4(),
        status: UserStatus.NOT_VERIFIED
      }
    });

    await this.sendVerificationEmail(newUser.email, newUser.verificationToken);
    return { newUser, message: 'Por favor, verifica tu correo electrónico para continuar!' };
  }
  
  async completeRegistration({ email, password, name, fullName }: CompleteRegistrationDto) {
    const user = await this.userService.findOneByEmail(email)
    if (!user || user.status === UserStatus.NOT_VERIFIED) {
      throw new UnauthorizedException('Correo electrónico no verificado o no registrado')
    }
    if ( !user.verificationToken ) {
      throw new UnauthorizedException('Token de verificación inválido')
    }

    const restaurant = await this.prisma.restaurant.create({
      data: {
        name,
        branches: {
          create: { name: 'Sucursal 1' },
        },
      },
    });

    const createdBranch = await this.prisma.branch.findFirst({
      where: { restaurantId: restaurant.id },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        fullName,
        password: await bcryptjs.hash(password, 6),
        branchId: createdBranch.id,
        ownedRestaurantId: restaurant.id,
        verificationToken: null,
        status: UserStatus.ACTIVE
      },
    });

    await this.prisma.category.create({
      data: {
        name: 'Sin Categoría',
        userId: user.id,
      },
    });

    const token = await this.generateToken( user, '30d');
    return { email, token };
  }

  async oAuthRegister({ email, name }: GoogleResitrationDto ) {
    const user = await this.userService.findOneByEmail( email );
    if (user) {
      const role = user.role
      if (user.branchId) {
        const token = await this.generateToken( user, '30d');
        return { user, email, token };
      }
      return { email, role, token: null };
    } else {  
      await this.prisma.user.create({
        data: {
          email: email,
          fullName: name,
          role: Role.OWNER,
          verificationToken: uuidv4(),
          status: UserStatus.NOT_VERIFIED,
          oauth: true
        }
      })
      return { user }
    }
  }
  
  async completeOAuthRegistration({ email, password, name, fullName }: CompleteRegistrationDto) {

    const user = await this.userService.findOneByEmail(email)

    const restaurant = await this.prisma.restaurant.create({
      data: {
        name,
        branches: {
          create: {
            name: 'Sucursal 1',
          },
        },
      },
    })

    const createdBranch = await this.prisma.branch.findFirst({
      where: {
        restaurantId: restaurant.id,
      },
    })

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        fullName: fullName,
        password: await bcryptjs.hash(password, 6),
        branchId: createdBranch.id,
        ownedRestaurantId: restaurant.id,
        status: UserStatus.ACTIVE
      },
    })

    await this.prisma.category.create({
      data: {
        name: 'Sin Categoría',
        userId: user.id,
      },
    })
    const token = await this.generateToken( user, '30d');

    return {
      email,
      token
    }
  }

  async sendVerificationEmail(email: string, verificationToken: string) {
    const verificationLink = `http://localhost:3001/api/auth/verify/${verificationToken}`
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
    const token = await this.generateToken( user, '30d');
  
    return { user, token };
  }

  async requestPasswordReset( email: string ) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('Aun no estás registrado');

    const resetToken = uuidv4();
    await this.prisma.user.update({
      where: { email },
      data: { resetPasswordToken: resetToken, resetPasswordExpires: new Date(Date.now() + 3600000) }, // Token expires in 1 hour
    });

    const resetLink = `http://localhost:3000/login/changepassword?token=${resetToken}&email=${email}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request',
      template: './reset-password',
      context: { resetLink },
    });

    return { ok: true }
  }

  async resetPassword( resetPasswordToken: string, newPassword: string ) {
    const user = await this.prisma.user.findFirst({
      where: { resetPasswordToken: resetPasswordToken, resetPasswordExpires: { gt: new Date() } },
    });
    if (!user) throw new UnauthorizedException('El Token is inválido o ha expirado.');

    const hashedPassword = await bcryptjs.hash(newPassword, 6);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetPasswordToken: null, resetPasswordExpires: null },
    });

    const token = await this.generateToken( user, '30d');

    return {
      token,
      message: 'Contraseña cambiada satisfactoriamente.',
    }
  }

}
