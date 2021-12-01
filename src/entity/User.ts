import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity({ name: 'users' })
class User extends BaseEntity {
  @PrimaryColumn({ type: 'uuid' })
  @Generated('uuid')
  id?: string

  @Column({ type: 'varchar', length: 150 })
  firstname: string

  @Column({ type: 'varchar', length: 150 })
  lastname: string

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string

  @Column({ type: 'text' })
  password: string

  @CreateDateColumn({ type: 'timestamp' })
  dateCreated?: Date

  @UpdateDateColumn({ type: 'timestamp' })
  dateUpdated?: Date
}

export default User
