import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Tag, User, UUID } from '.';
import { invalidRingNameError, invalidRingNameTooLongError, invalidRingNameTooShortError,
	invalidRingUrlError, invalidRingUrlTooLongError,
	invalidRingUrlTooShortError } from '../api/api-error-response';
import { InvalidRingNameError, InvalidRingUrlError } from '../app/error';
import { webringConfig } from '../config';

@Entity('ring')
export class Webring
{
	@PrimaryGeneratedColumn('uuid', {
		name: 'ring_id'
	})
	public ringId?: UUID;

	@Column({
		name: 'name',
		type: 'text'
	})
	public name: string;

	@Column({
		name: 'url',
		type: 'text'
	})
	public url: string;

	@Column({
		name: 'description',
		type: 'text'
	})
	public description: string;

	@Column({
		name: 'private',
		type: 'text'
	})
	public private: boolean;

	@Column({
		name: 'created_by',
		type: 'uuid'
	})
	public createdBy: UUID;

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

	@ManyToMany(type => Tag, {
		eager: true,
	})
	@JoinTable({
		name: 'tagged_ring',
		joinColumn: {
			name: 'ring_id',
			referencedColumnName: 'ringId'
		},
		inverseJoinColumn: {
			name: 'tag_id',
			referencedColumnName: 'tagId'
		}
	})
	public tags!: Tag[];

	/**
	 * The non-owner moderators of this webring.
	 */
	@ManyToMany(type => User)
	@JoinTable({
		name: 'ring_moderator',
		joinColumn: {
			name: 'ring_id',
			referencedColumnName: 'ringId'
		},
		inverseJoinColumn: {
			name: 'user_id',
			referencedColumnName: 'userId'
		}
	})
	public moderators!: User[];

	constructor(_name: Readonly<string>,
		_description: Readonly<string>,
		_url: Readonly<string>,
		_private: Readonly<boolean>,
		_createdBy: Readonly<UUID>)
	{
		this.name = _name;
		this.description = _description;
		this.url = _url;
		this.private = _private;
		this.createdBy = _createdBy;
		this.dateDeleted = null;
		this.dateCreated = new Date();
		this.dateModified = new Date();
	}

	/**
	 * Validates a webring name.
	 * Throws a descriptive exception in case of validation failure.
	 * @param {string} name - The name to validate.
	 * @throws {InvalidRingNameError} This API returnable exception is raised with a
	 * detailed error message in the case of a validation failure.
	 */
	public static validateName(name: Readonly<string>): void
	{
		if (!name) {
			throw new InvalidRingNameError(invalidRingNameError.message,
				invalidRingNameError.code, invalidRingNameError.httpStatus);
		}

		// Check name length.
		if (name.length < webringConfig.nameRequirements.minLength) {
			throw new InvalidRingNameError(invalidRingNameTooShortError.message,
				invalidRingNameTooShortError.code, invalidRingNameTooShortError.httpStatus);
		}

		if (name.length > webringConfig.nameRequirements.maxLength) {
			throw new InvalidRingNameError(invalidRingNameTooLongError.message,
				invalidRingNameTooLongError.code, invalidRingNameTooLongError.httpStatus);
		}
	}


	/**
	* Normalises a supplied webring name.
	* Ensures that a webring name is stored in a suitable format.
	* @param {string} name - The webring name to normalise.
	* @returns The normalised webring name.
	* @throws {InvalidRingNameError} This API returnable exception is raised in the case
	* that no name is provided.
	*/
	public static normaliseName(name: Readonly<string>): string
	{
		if (!name) {
			throw new InvalidRingNameError(invalidRingNameError.message,
				invalidRingNameError.code, invalidRingNameError.httpStatus);
		}

		return name.trim();
	}

	/**
	 * Validates a ring's URL.
	 * @param {string} name - The webring URL to validate.
	 * @throws {InvalidRingUrlError} This API returnable exception is raised in the case
	 * that the provided URL is invalid.
	 */
	public static validateUrl(url: Readonly<string>): void
	{
		if (!url) {
			throw new InvalidRingUrlError(invalidRingUrlError.message,
				invalidRingUrlError.code, invalidRingUrlError.httpStatus);
		}

		// Check for the existence of invalid characters.
		if (new RegExp(/([^a-z_0-9])/g).test(url)) {
			throw new InvalidRingUrlError(invalidRingUrlError.message,
				invalidRingUrlError.code, invalidRingUrlError.httpStatus);
		}

		// Check URL length.
		if (url.length < webringConfig.urlRequirements.minLength) {
			throw new InvalidRingUrlError(invalidRingUrlTooShortError.message,
				invalidRingUrlTooShortError.code, invalidRingUrlTooShortError.httpStatus);
		}

		if (url.length > webringConfig.urlRequirements.maxLength) {
			throw new InvalidRingUrlError(invalidRingUrlTooLongError.message,
				invalidRingUrlTooLongError.code, invalidRingUrlTooLongError.httpStatus);
		}
	}

	/**
	* Normalises a supplied webring URL.
	* Ensures that a webring URL is stored in a suitable format.
	* @param {string} url - The webring URL to normalise.
	* @returns The normalised webring URL.
	* @throws {InvalidRingNameError} This API returnable exception is raised in the case
	* that no username is provided.
	*/
	public static normaliseUrl(url: Readonly<string>): string
	{
		if (!url) {
			throw new InvalidRingUrlError(invalidRingUrlError.message,
				invalidRingUrlError.code, invalidRingUrlError.httpStatus);
		}

		return url.toLowerCase().trim();
	}
}
