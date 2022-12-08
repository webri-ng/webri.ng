import * as dayjs from 'dayjs';
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { InvalidEmailError, InvalidPasswordError, InvalidUsernameError } from '../app/error';
import { invalidEmailAddressError, invalidNewPasswordTooLongError,
	invalidNewPasswordTooShortError, invalidNewPasswordError, invalidUsernameError,
	invalidUsernameTooLongError, invalidUsernameTooShortError, invalidUsernameCharacters
} from '../api/api-error-response';
import { userConfig } from '../config';
import { UUID, Webring } from '.';

@Entity('user_account')
export class User
{
	@PrimaryGeneratedColumn('uuid', {
		name: 'user_id'
	})
	public userId?: UUID;

	@Column({
		name: 'username',
		type: 'text'
	})
	public username: string;

	@Column({
		name: 'email',
		type: 'text'
	})
	public email: string;

	@Column({
		name: 'password_hash',
		type: 'text'
	})
	public passwordHash: string;

	@Column({
		name: 'password_set_time',
		type: 'timestamptz'
	})
	public passwordSetTime: Date;

	@Column({
		name: 'password_expiry_time',
		type: 'timestamptz',
		nullable: true
	})
	public passwordExpiryTime: Date | null;

	@Column({
		name: 'date_last_login',
		type: 'timestamptz',
		nullable: true
	})
	public dateLastLogin: Date | null;

	/**
	 * The number of unsuccessful login attempts that this user has made.
	 */
	 @Column({
		name: 'login_attempt_count',
		type: 'integer'
	})
	public loginAttemptCount: number;

	@Column({
		name: 'locked_due_to_failed_auth',
		type: 'boolean'
	})
	public lockedDueToFailedAuth: boolean;

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

	@Column({
		name: 'date_modified',
		type: 'timestamptz',
		nullable: true
	})
	public dateModified: Date;

	@ManyToMany(type => Webring)
	@JoinTable({
		name: 'ring_moderator',
		joinColumn: {
			name: 'user_id',
			referencedColumnName: 'userId'
		},
		inverseJoinColumn: {
			name: 'ring_id',
			referencedColumnName: 'ringId'
		}
	})
	public moderatedWebrings!: Promise<Webring[]>;

	constructor(_username: string,
		_email: string,
		_passwordHash: string)
	{
		this.username = _username;
		this.email = _email;
		this.passwordHash = _passwordHash;
		this.passwordSetTime = new Date();
		this.passwordExpiryTime = User.getPasswordExpiryDate();
		this.lockedDueToFailedAuth = false;
		this.dateDeleted = null;
		this.dateCreated = new Date();
		this.dateModified = new Date();
		this.dateLastLogin = null;
		this.loginAttemptCount = 0;
	}


	/**
	 * Randomly generates a string suitable for use as a temporary user password.
	 * @returns The newly generated password string.
	 */
	public static generateRandomPassword(): string
	{
		return Math.random().toString(36).substring(2);
	}


	/**
	 * Returns the password expiry date for a password set on the specified date.
	 * If an expiry period has not been set in the global customer config, then
	 * null is returned.
	 * @param {Date} fromDate - The date to measure from.
	 * @returns The new expiry date, or null if no expiry date configured.
	 */
	public static getPasswordExpiryDate(fromDate: Date = new Date()): Date | null
	{
		// If an expiry period has been specified in the application config.
		if (userConfig.password.expiryPeriod) {
			return dayjs(fromDate)
				.add(...userConfig.password.expiryPeriod).toDate();
		}

		return null;
	}


	/**
	 * Returns the expiry date for a temporary password set on a specified date.
	 * @param {Date} fromDate - The date to measure from.
	 * @returns The expiry date.
	 */
	public static getTempPasswordExpiryDate(fromDate: Date = new Date()): Date
	{
		return dayjs(fromDate)
			.add(...userConfig.password.tempPasswordExpiryPeriod).toDate();
	}


	/**
	 * Validates a new password.
	 * Does not return, throws a descriptive exception in case of validation failure.
	 * @param {string} password - The password to validate.
	 * @throws {InvalidPasswordError} - This API returnable exception is raised with a
	 * detailed error message in the case of a validation failure.
	 */
	public static validateNewPassword(password: string): void
	{
		if (!password) {
			throw new InvalidPasswordError(invalidNewPasswordError.message,
				invalidNewPasswordError.code, invalidNewPasswordError.httpStatus);
		}

		if (password.length < userConfig.password.minLength) {
			throw new InvalidPasswordError(invalidNewPasswordTooShortError.message,
				invalidNewPasswordTooShortError.code, invalidNewPasswordTooShortError.httpStatus);
		}

		if (password.length > userConfig.password.maxLength) {
			throw new InvalidPasswordError(invalidNewPasswordTooLongError.message,
				invalidNewPasswordTooLongError.code, invalidNewPasswordTooLongError.httpStatus);
		}
	}


	/**
	 * Tests whether a user's password has expired.
	 * @returns A boolean indicating whether or not the password has expired.
	 */
	public hasPasswordExpired(): boolean
	{
		if (this.passwordExpiryTime) {
			if (dayjs().isAfter(this.passwordExpiryTime)) {
				return true;
			}
		}

		return false;
	}


	/**
	 * Validates an email address.
	 * Does not return, raises a descriptive exception in case of validation failure.
	 * See: https://emailregex.com/
	 * @param {string} email - The email address to validate.
	 * @throws {InvalidEmailError} - This API returnable exception is raised with a
	 * detailed error message in the case of a validation failure.
	 */
	public static validateEmailAddress(email: string): void
	{
		if (!email) {
			throw new InvalidEmailError(invalidEmailAddressError.message,
				invalidEmailAddressError.code, invalidEmailAddressError.httpStatus);
		}

		// Split regex into smaller components which can be joined.
		const regexComponents = [
			/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@/,
			/((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		];

		// Join regex components and compile regex.
		const regexSource = regexComponents.map(r => r.source).join('');
		const emailValidator = new RegExp(regexSource);

		if (!emailValidator.test(email)) {
			throw new InvalidEmailError(invalidEmailAddressError.message,
				invalidEmailAddressError.code, invalidEmailAddressError.httpStatus);
		}
	}


	/**
	 * Normalises a supplied email address.
	 * Ensures an email address is stored in a correct format.
	 * @param {string} email The email address string to normalise.
	 * @returns The normalised email.
	 */
	public static normaliseEmailAddress(email: string): string
	{
		if (!email) {
			throw new InvalidEmailError(invalidEmailAddressError.message,
				invalidEmailAddressError.code, invalidEmailAddressError.httpStatus);
		}

		return email.trim().toLowerCase();
	}


	/**
	 * Validates a username.
	 * Throws a descriptive exception in case of validation failure.
	 * @param {string} username - The username to validate.
	 * @throws {InvalidUsernameError} This API returnable exception is raised with a
	 * detailed error message in the case of a validation failure.
	 */
	public static validateUsername(username: string): void
	{
		if (!username) {
			throw new InvalidUsernameError(invalidUsernameError.message,
				invalidUsernameError.code, invalidUsernameError.httpStatus);
		}

		// Check name length.
		if (username.length < userConfig.usernameRequirements.minLength) {
			throw new InvalidUsernameError(invalidUsernameTooShortError.message,
				invalidUsernameTooShortError.code, invalidUsernameTooShortError.httpStatus);
		}

		if (username.length > userConfig.usernameRequirements.maxLength) {
			throw new InvalidUsernameError(invalidUsernameTooLongError.message,
				invalidUsernameTooLongError.code, invalidUsernameTooLongError.httpStatus);
		}

		// Test for the existence of invalid characters.
		if (!new RegExp(/^[A-z_0-9]+$/).test(username)) {
			throw new InvalidUsernameError(invalidUsernameCharacters.message,
				invalidUsernameCharacters.code, invalidUsernameCharacters.httpStatus);
		}
	}


	/**
	 * Normalises a supplied username.
	 * Ensures that a username is stored in a suitable format.
	 * @param {string} username - The username to normalise.
	 * @returns The normalised username.
	 * @throws {InvalidUsernameError} This API returnable exception is raised in the case
	 * that no username is provided.
	 */
	public static normaliseUsername(username: string): string
	{
		if (!username) {
			throw new InvalidUsernameError(invalidUsernameError.message,
				invalidUsernameError.code, invalidUsernameError.httpStatus);
		}

		return username.toLowerCase().trim();
	}
}
