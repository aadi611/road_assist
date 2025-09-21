import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
@Index(['phone_number'])
@Index(['firebase_uid'])
@Index(['created_at'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ 
    type: 'varchar', 
    length: 15, 
    unique: true,
    nullable: false 
  })
  phone_number: string;

  @Column({ 
    type: 'varchar', 
    length: 128, 
    unique: true,
    nullable: true 
  })
  firebase_uid: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ 
    type: 'boolean', 
    default: false 
  })
  is_verified: boolean;

  @Column({ 
    type: 'jsonb', 
    nullable: true 
  })
  profile_data: Record<string, any>;

  @Column({ 
    type: 'varchar', 
    length: 50,
    default: 'user'
  })
  role: string;

  @Column({ 
    type: 'boolean', 
    default: true 
  })
  is_active: boolean;

  @Column({ 
    type: 'timestamp',
    nullable: true 
  })
  last_login_at: Date;

  // Virtual properties for API responses
  toJSON() {
    const { firebase_uid, ...result } = this;
    return result;
  }
}
