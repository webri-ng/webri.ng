import {
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	PrimaryGeneratedColumn
} from 'typeorm';
import { Tag, User, UUID } from '.';
import {
	invalidRingNameCharacters,
	invalidRingNameError,
	invalidRingNameTooLongError,
	invalidRingNameTooShortError,
	invalidRingUrlError,
	invalidRingUrlTooLongError,
	invalidRingUrlTooShortError
} from '../api/api-error-response';
import { webringConfig } from '../config';
import { ApiReturnableError } from '../app/error';

@Entity('ring')
export class Webring {
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

	@ManyToMany((_type) => Tag, {
		eager: true
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
	@ManyToMany((_type) => User)
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

	constructor(
		_name: string,
		_description: string,
		_url: string,
		_private: boolean,
		_createdBy: UUID
	) {
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
	 * @throws {ApiReturnableError} This API returnable exception is raised with a
	 * detailed error message in the case of a validation failure.
	 */
	public static validateName(name: string): void {
		if (!name) {
			throw ApiReturnableError.fromApiErrorResponseDetails(
				invalidRingNameError
			);
		}

		// Check name length.
		if (name.length < webringConfig.nameRequirements.minLength) {
			throw ApiReturnableError.fromApiErrorResponseDetails(
				invalidRingNameTooShortError
			);
		}

		if (name.length > webringConfig.nameRequirements.maxLength) {
			throw ApiReturnableError.fromApiErrorResponseDetails(
				invalidRingNameTooLongError
			);
		}

		// Test for the existence of invalid characters.
		if (new RegExp(/[<>]/).test(name)) {
			throw ApiReturnableError.fromApiErrorResponseDetails(
				invalidRingNameCharacters
			);
		}
	}

	/**
	 * Normalises a supplied webring name.
	 * Ensures that a webring name is stored in a suitable format.
	 * @param {string} name - The webring name to normalise.
	 * @returns The normalised webring name.
	 * @throws {ApiReturnableError} This API returnable exception is raised in the case
	 * that no name is provided.
	 */
	public static normaliseName(name: string): string {
		if (!name) {
			throw ApiReturnableError.fromApiErrorResponseDetails(
				invalidRingNameError
			);
		}

		return name.trim();
	}

	/**
	 * Validates a ring's URL.
	 * @param {string} name - The webring URL to validate.
	 * @throws {ApiReturnableError} This API returnable exception is raised in the case
	 * that the provided URL is invalid.
	 */
	public static validateUrl(url: string): void {
		if (!url) {
			throw ApiReturnableError.fromApiErrorResponseDetails(invalidRingUrlError);
		}

		// Check for the existence of invalid characters.
		if (new RegExp(/([^a-z_0-9])/g).test(url)) {
			throw ApiReturnableError.fromApiErrorResponseDetails(invalidRingUrlError);
		}

		// Check URL length.
		if (url.length < webringConfig.urlRequirements.minLength) {
			throw ApiReturnableError.fromApiErrorResponseDetails(
				invalidRingUrlTooShortError
			);
		}

		if (url.length > webringConfig.urlRequirements.maxLength) {
			throw ApiReturnableError.fromApiErrorResponseDetails(
				invalidRingUrlTooLongError
			);
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
	public static normaliseUrl(url: string): string {
		if (!url) {
			throw ApiReturnableError.fromApiErrorResponseDetails(invalidRingUrlError);
		}

		return url.toLowerCase().trim();
	}

	public doesUserOwnThisWebring(user: Readonly<User>): boolean {
		return this.createdBy === user.userId;
	}
}
