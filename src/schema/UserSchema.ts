import { Field, ObjectType } from 'type-graphql'
import { DateTimeResolver } from 'graphql-scalars'

@ObjectType()
class User {
  @Field()
  id?: string

  @Field()
  firstname: string

  @Field()
  lastname: string

  @Field()
  email: string

  @Field(() => DateTimeResolver)
  dateCreated?: Date

  @Field(() => DateTimeResolver)
  dateUpdated?: Date
}

export default User
