import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Point,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export type IssueType = 'pothole' | 'garbage' | 'broken_streetlight' | 'damaged_road' | 'other';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type ReportStatus = 'submitted' | 'processing' | 'analyzed' | 'certificate_generated' | 'tweeted' | 'completed' | 'failed';

@Entity('reports')
@Index(['location'], { spatial: true })
@Index(['created_at'])
@Index(['status'])
@Index(['user_id', 'created_at'])
@Index(['issue_type', 'severity'])
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  user_id: string;

  @Column({ type: 'text' })
  image_url: string;

  @Column({ type: 'jsonb', nullable: true })
  image_metadata: Record<string, any>;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: Point;

  @Column({ type: 'jsonb' })
  address: Record<string, any>;

  @Column({
    type: 'varchar',
    length: 50,
    enum: ['pothole', 'garbage', 'broken_streetlight', 'damaged_road', 'other'],
  })
  issue_type: IssueType;

  @Column({
    type: 'varchar',
    length: 20,
    enum: ['low', 'medium', 'high', 'critical'],
  })
  severity: Severity;

  @Column({ type: 'jsonb', nullable: true })
  ai_analysis: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'submitted',
    enum: ['submitted', 'processing', 'analyzed', 'certificate_generated', 'tweeted', 'completed', 'failed'],
  })
  status: ReportStatus;

  @Column({ type: 'jsonb', nullable: true })
  processing_metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Virtual properties for API responses
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      image_url: this.image_url,
      location: this.location,
      address: this.address,
      issue_type: this.issue_type,
      severity: this.severity,
      description: this.description,
      status: this.status,
      ai_analysis: this.ai_analysis,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}
