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

    @Column()
    gender: string;

    @Column()
    age: number;

    @Column()
    phone_number: string;

    @Column()
    full_address: string;

    @Column()
    country: string;

    @Column('decimal')
    salary: number;

    @Column()
    currency: string;

    @Column({ unique: true })
    email: string;

    @Column()
    hire_date: string;

    @Column()
    employment_type: string;

    @Column('decimal')
    performance_rating: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}