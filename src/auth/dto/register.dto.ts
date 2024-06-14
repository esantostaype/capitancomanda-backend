import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class RegisterOwnerDto {
  @IsEmail()
  email: string

  @IsString()
  fullName: string
}

export class CompleteRegistrationDto {
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  password: string

  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsString()
  fullName: string

  token: string

  registered: boolean
}

export class GoogleResitrationDto {
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  name: string
}

export class CreateRestaurantDto {
  name: string
  owner: {
    fullName: string
    email: string
    password: string
    verificationToken: string
  }
  branch: {
    name: string
  }
}