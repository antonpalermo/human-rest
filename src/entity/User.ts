import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  PrimaryColumn,
} from 'typeorm'
import { v4 as uuid } from 'uuid'

@Entity({ name: 'users' })
class User extends BaseEntity {
  @PrimaryColumn('uuid')
  id?: string

  @Column({ type: 'varchar', length: 150 })
  firstname: string

  @Column({ type: 'varchar', length: 150 })
  lastname: string

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string

  @Column({ type: 'text' })
  password: string

  @Column({ type: 'timestamptz' })
  dateCreated?: Date

  @Column({ type: 'timestamptz' })
  dateUpdated?: Date

  @BeforeInsert()
  parseUserId() {
    // use uuid then remove the "-" sign
    this.id = uuid().replace(/-/g, '')
  }
}

export default User
