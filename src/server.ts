import express from 'express'

const main = async () => {
  const app = express()
  const port = process.env.PORT || 4000

  app.get('/', (_, res) => {
    res.status(200).send({ status: 'good' })
  })

  app.listen(port, () => console.log('server running'))
}

main().catch((err) => console.log(err))
