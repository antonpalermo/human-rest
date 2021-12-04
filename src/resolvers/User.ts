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
  async user(
    @Arg('id') id: string,
    @Ctx() { redis }: MainContext
  ): Promise<UserSchema> {
    // get the list
    const list = (await redis.lrange(__rdsUserKey, 0, -1)) || []
    // convert the list to array
    const data = list.map((x) => JSON.parse(x))
    // return the queried user.
    return data.find((x) => x.id === id)
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
    @Arg('user') user: UserData,
    @Ctx() { redis }: MainContext
  ): Promise<UserSchema> {
    const {
      raw: [updatedUser],
    } = await getRepository(User)
      .createQueryBuilder('user')
      .update()
      .where('id = :id', { id })
      .set({ ...user })
      .returning([
        'id',
        'firstname',
        'lastname',
        'email',
        'dateCreated',
        'dateUpdated',
      ])
      .execute()

    console.log(updatedUser)

    const list = (await redis.lrange(__rdsUserKey, 0, -1)) || []
    const index = list.findIndex((x: string) => JSON.parse(x).id === id)
    console.log(index)
    await redis.lset(__rdsUserKey, index, JSON.stringify(updatedUser))

    return updatedUser
  }

  @Mutation(() => UserSchema)
  async delete(
    @Arg('id') id: string,
    @Ctx() { redis }: MainContext
  ): Promise<UserSchema> {
    const {
      raw: [deletedUser],
    } = await getRepository(User)
      .createQueryBuilder('user')
      .delete()
      .where('id = :id', { id })
      .returning([
        'id',
        'firstname',
        'lastname',
        'email',
        'dateCreated',
        'dateUpdated',
      ])
      .execute()

    const list = (await redis.lrange(__rdsUserKey, 0, -1)) || []
    const index = list.findIndex((x: string) => JSON.parse(x).id === id)
    await redis.lrem(__rdsUserKey, index, JSON.stringify(deletedUser))
    return deletedUser
  }
}

export default UserResolver
