import 'reflect-metadata'
import morgan from 'morgan'
import express from 'express'
import { buildSchema } from 'type-graphql'
import { ApolloServer } from 'apollo-server-express'

const main = async () => {
  const app = express()
  const port = process.env.PORT || 4000

  app.use(express.json())
  app.use(morgan('common'))

  app.get('/', (_, res) => {
    res.status(200).send({ status: 'good' })
  })

  const apollo = new ApolloServer({
    schema: await buildSchema({
      resolvers: [`${__dirname}/resolvers/**/*.ts`],
    }),
  })

  console.log('starting apollo server...')

  await apollo.start()

  console.log('applying apollo middleware...')

  apollo.applyMiddleware({ app })

  app.listen(port, () => console.log('server running...'))
}

main().catch((err) => console.log(err))
