import { Request, Response } from 'express'
import { Redis } from 'ioredis'

export type MainContext = {
  req: Request
  res: Response
  redis: Redis
}
