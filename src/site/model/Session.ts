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

	/**
	 * This field represents the date that a session was 'ended'. If a user manually logs out
	 * this will end the session, invalidating it.
	 */
	@Column({
		name: 'date_ended',
		type: 'timestamptz',
		nullable: true
	})
	public dateEnded: Date | null;

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

	constructor(_userId: string,
		expiryDate: Date | null = null)
	{
		this.userId = _userId;
		this.expiryDate = expiryDate || Session.getDefaultExpiryDate();
		this.dateDeleted = null;
		this.dateCreated = new Date();
		this.dateEnded = null;
	}

	/**
	 * Calculates the expiry date of a session based on an arbitrary effective date.
	 * @param {Date} [effectiveDate] - The effective date of the session to compute from.
	 * Defaults to the current date.
	 * @returns The expiry date of a session with this effective date.
	 */
	 public static getDefaultExpiryDate(effectiveDate: Date = new Date()): Date {
		return dayjs(effectiveDate).add(...sessionConfig.validityPeriod).toDate();
	}


	/**
	 * The number of seconds remaining in the session.
	 */
	public get secondsRemaining(): number {
		return dayjs(this.expiryDate).diff(new Date(), 'seconds');
	}


	/**
	 * Calculates whether a session has been invalidated, as of an arbitrary effective date.
	 * @param {Date} [effectiveDate] The effective date of the session to calculate from.
	 * Defaults to the current date.
	 * @returns Whether this session has been invalidated.
	 */
	public isInvalidated(effectiveDate: Date = new Date()): boolean {
		return dayjs(effectiveDate).isAfter(this.dateEnded);
	}


	/**
	 * Calculates whether a session is active, as of an arbitrary effective date.
	 * @param {Date} [effectiveDate] The effective date of the session to calculate from.
	 * Defaults to the current date.
	 * @returns Whether the session is active.
	 */
	public isActive(effectiveDate: Date = new Date()): boolean {
		if (dayjs(effectiveDate).isAfter(this.expiryDate)) {
			return false;
		}

		if (dayjs(effectiveDate).isBefore(this.dateCreated)) {
			return false;
		}

		return true;
	}
}
