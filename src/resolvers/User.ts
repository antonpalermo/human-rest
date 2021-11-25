import User from '../entity/User'
import { Arg, Field, InputType, Mutation, Query, Resolver } from 'type-graphql'
import { getRepository } from 'typeorm'
import UserSchema from '../schema/UserSchema'

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
  async users(): Promise<UserSchema[]> {
    return await getRepository(User).createQueryBuilder('user').getMany()
  }

  @Query(() => UserSchema, { nullable: true })
  async user(@Arg('id') id: string): Promise<UserSchema> {
    return await getRepository(User)
      .createQueryBuilder('user')
      .select()
      .where('id = :id', { id })
      .getOneOrFail()
  }

  @Mutation(() => UserSchema)
  async create(@Arg('user') user: UserData): Promise<UserSchema> {
    return (
      await getRepository(User)
        .createQueryBuilder('users')
        .insert()
        .into('users')
        .values({ ...user })
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
