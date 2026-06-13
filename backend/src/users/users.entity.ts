import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, length: 100 })
    username: string;

    @Column({ length: 255 })
    password_hash: string;

    @Column({ type: 'enum', enum: ['admin', 'viewer'], default: 'viewer' })
    role: 'admin' | 'viewer';

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
