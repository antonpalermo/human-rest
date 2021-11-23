import { Query, Resolver } from 'type-graphql'

@Resolver()
class UserResolver {
  @Query(() => [String])
  users() {
    return ['Jhon', 'Jane', 'Mike']
  }
}

export default UserResolver
