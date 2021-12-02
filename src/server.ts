import 'dotenv/config'
import 'reflect-metadata'
import cors from 'cors'
import morgan from 'morgan'
import express, { Request, Response } from 'express'
import Redis from 'ioredis'
import { buildSchema } from 'type-graphql'
import { ApolloServer } from 'apollo-server-express'
import { createConnection, getConnection } from 'typeorm'
import { __rdsUserKey } from './constants'
import User from './entity/User'

const main = async () => {
  const app = express()
  const port = process.env.PORT || 4000

  const redis = new Redis({
    host: process.env.APP_RDS_HOST,
    port: parseInt(process.env.APP_RDS_PORT || ''),
    password: process.env.APP_RDS_PASS,
  })

  app.use(express.json())
  app.use(morgan('common'))
  app.use(cors({ origin: process.env.HOST, credentials: true }))

  const apollo = new ApolloServer({
    schema: await buildSchema({
      resolvers: [`${__dirname}/resolvers/**/*.ts`],
      dateScalarMode: 'timestamp',
    }),
    context: (req: Request, res: Response) => ({ req, res, redis }),
    introspection: true,
  })

  const populateUsers = async () => {
    console.log('populating users...')
    await redis.del(__rdsUserKey)
    const usersList = await getConnection()
      .getRepository(User)
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstname',
        'user.lastname',
        'user.email',
        'user.dateCreated',
        'user.dateUpdated',
      ])
      .cache(true)
      .getMany()

    const mappedUsersList = usersList.map((x) => JSON.stringify(x))

    await redis.lpush(__rdsUserKey, ...mappedUsersList)
  }

  console.log('initializing database...')

  await createConnection()
  await populateUsers()

  console.log('starting apollo server...')

  await apollo.start()

  console.log('applying apollo middleware...')

  apollo.applyMiddleware({ app, path: '/', cors: false })

  app.listen(port, () => console.log('server running...'))
}

main().catch((err) => console.log(err))
