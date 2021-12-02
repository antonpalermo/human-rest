import User from '../entity/User'
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql'
import { getRepository } from 'typeorm'
import UserSchema from '../schema/UserSchema'

import { hash } from 'argon2'
import { MainContext } from '../modules'
import { __rdsUserKey } from '../constants'

@InputType()
class UserData {
  @Field(() => String, { nullable: true })
  firstname?: string

  @Field(() => String, { nullable: true })
  lastname?: string

  @Field(() => String, { nullable: true })
  email?: string

  @Field(() => String, { nullable: true })
  password: string
}

@Resolver(() => UserSchema)
class UserResolver {
  @Query(() => [UserSchema])
  async users(@Ctx() { redis }: MainContext): Promise<UserSchema[]> {
    const list = (await redis.lrange(__rdsUserKey, 0, -1)) || []
    return list.map((x) => JSON.parse(x))
  }

  @Query(() => UserSchema, { nullable: true })
  async user(@Arg('id') id: string): Promise<UserSchema> {
    return await getRepository(User)
      .createQueryBuilder('user')
      .select()
      .where('id = :id', { id })
      .cache(1000 * 60 * 30)
      .getOneOrFail()
  }

  @Mutation(() => UserSchema)
  async create(@Arg('user') user: UserData): Promise<UserSchema> {
    return (
      await getRepository(User)
        .createQueryBuilder('users')
        .insert()
        .into('users')
        .values({ ...user, password: await hash(user.password) })
        .returning('*')
        .execute()
    ).raw[0]
  }

  @Mutation(() => UserSchema)
  async update(
    @Arg('id') id: string,
    @Arg('user') user: UserData
  ): Promise<UserSchema> {
    return (
      await getRepository(User)
        .createQueryBuilder()
        .update()
        .where('id = :id', { id })
        .set({ ...user })
        .returning('*')
        .execute()
    ).raw[0]
  }

  @Mutation(() => UserSchema)
  async delete(@Arg('id') id: string): Promise<UserSchema> {
    return (
      await getRepository(User)
        .createQueryBuilder('users')
        .delete()
        .where('id = :id', { id })
        .returning('*')
        .execute()
    ).raw[0]
  }
}

export default UserResolver
