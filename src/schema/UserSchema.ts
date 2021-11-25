import { Field, ObjectType } from 'type-graphql'

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

  @Field()
  dateCreated?: Date

  @Field()
  dateUpdated?: Date
}

export default User
