import { Entity, Column, PrimaryColumn, CreateDateColumn } from "typeorm";

@Entity()
export class Patient {
  @PrimaryColumn("text")
  id: string;

  @Column("text")
  firstName: string;

  @Column("text")
  lastName: string;

  @Column("text")
  birthDate: string;

  @CreateDateColumn()
  createdAt: Date;
}
