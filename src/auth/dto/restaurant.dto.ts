export class CreateRestaurantDto {
  name: string
  owner: {
    email: string
    password: string
    verificationToken: string
  }
  branch: {
    name: string
  }
}

export class CreateRestaurantGoogleDto {
  email: string;
  id: string;
  emails?: {
    value: string;
  }[];
  displayName: string;
  branch: {
    name: string;
  };
}