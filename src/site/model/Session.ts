import * as dayjs from 'dayjs';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { sessionConfig } from '../config';
import { UUID } from '.';

@Entity('user_session')
export class Session
{
	@PrimaryGeneratedColumn('uuid', {
		name: 'session_id'
	})
	public sessionId?: UUID;

	@Column({
		name: 'user_id',
		type: 'uuid'
	})
	public userId: UUID;

	@Column({
		name: 'expiry_date',
		type: 'timestamptz',
		nullable: true
	})
	public expiryDate: Date | null;

	@Column({
		name: 'date_deleted',
		type: 'timestamptz',
		nullable: true
	})
	public dateDeleted: Date | null;

	@Column({
		name: 'date_created',
		type: 'timestamptz',
		nullable: true
	})
	public dateCreated: Date;

	constructor(_userId: Readonly<string>,
		expiryDate: Date | null = null)
	{
		this.userId = _userId;
		this.expiryDate = expiryDate || Session.getDefaultExpiryDate();
		this.dateDeleted = null;
		this.dateCreated = new Date();
	}

	/**
	 * Calculates the expiry date of a session based on an arbitrary effective date.
	 * @param {Date} [effectiveDate] - The effective date of the session to compute from.
	 * Defaults to the current date.
	 * @returns The expiry date of a session with this effective date.
	 */
	 public static getDefaultExpiryDate(effectiveDate: Readonly<Date> = new Date()): Date {
		return dayjs(effectiveDate).add(...sessionConfig.validityPeriod).toDate();
	}
}
