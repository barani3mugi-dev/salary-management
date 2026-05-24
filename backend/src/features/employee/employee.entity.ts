import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  full_name: string;

  @Column()
  job_title: string;

  @Column()
  department: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  full_address: string;

  @Column()
  country: string;

  @Column('decimal', { precision: 12, scale: 2 })
  salary: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'date' })
  hire_date: string;

  @Column({ default: 'Full-time' })
  employment_type: string;

  @Column('decimal', { precision: 3, scale: 1, nullable: true })
  performance_rating: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}