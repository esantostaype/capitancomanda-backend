// /* eslint-disable @typescript-eslint/ban-types */
// import { Inject, Injectable } from "@nestjs/common";
// import { PassportSerializer } from "@nestjs/passport";
// import { User } from "@prisma/client";
// import { UserService } from "src/user/user.service";

// @Injectable()
// export class SessionSerializer extends PassportSerializer {
//   constructor(
//     @Inject('AUTH_SERVICE') private readonly userService: UserService
//   ){
//     super()
//   }

//   serializeUser( user: User, done: Function ) {
//     console.log("Serializer User")
//     done( null, user )
//   }

//   deserializeUser( payload: any, done: Function ) {
//     console.log("Deserializer User")
//     const user = this.userService.findOne( payload.id )
//     return user ? done( null, user ) : done( null, null )
//   }
// }