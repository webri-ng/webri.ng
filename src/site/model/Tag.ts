import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { invalidTagNameError, invalidTagNameTooLongError,
	invalidTagNameTooShortError } from '../api/api-error-response';
import { InvalidTagNameError } from '../app/error';
import { tagConfig } from '../config';
import { UUID } from '.';
import { Webring } from './Webring';

@Entity('tag')
export class Tag
{
	@PrimaryGeneratedColumn('uuid', {
		name: 'tag_id'
	})
	public tagId?: UUID;

	@Column({
		name: 'name',
		type: 'text'
	})
	public name: string;

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

	@ManyToMany(_type => Webring)
	@JoinTable({
		name: 'tagged_ring',
		joinColumn: {
			name: 'tag_id',
			referencedColumnName: 'tagId'
		},
		inverseJoinColumn: {
			name: 'ring_id',
			referencedColumnName: 'ringId'
		}
	})
	public taggedWebrings!: Promise<Webring[]>;

	constructor(_name: string,
		_createdBy: UUID)
	{
		this.name = _name;
		this.createdBy = _createdBy;
		this.dateDeleted = null;
		this.dateCreated = new Date();
		this.dateModified = new Date();
	}

	/**
	 * Validates a tag name.
	 * Throws a descriptive exception in case of validation failure.
	 * @param {string} name - The name to validate.
	 * @throws {InvalidTagNameError} This API returnable exception is raised with a
	 * detailed error message in the case of a validation failure.
	 */
	public static validateName(name: string): void
	{
		if (!name) {
			throw new InvalidTagNameError(invalidTagNameError.message,
				invalidTagNameError.code, invalidTagNameError.httpStatus);
		}

		// Check for the existence of invalid characters.
		if (new RegExp(/([^a-z_0-9])/g).test(name)) {
			throw new InvalidTagNameError(invalidTagNameError.message,
				invalidTagNameError.code, invalidTagNameError.httpStatus);
		}

		// Check name length.
		if (name.length < tagConfig.nameRequirements.minLength) {
			throw new InvalidTagNameError(invalidTagNameTooShortError.message,
				invalidTagNameTooShortError.code, invalidTagNameTooShortError.httpStatus);
		}

		if (name.length > tagConfig.nameRequirements.maxLength) {
			throw new InvalidTagNameError(invalidTagNameTooLongError.message,
				invalidTagNameTooLongError.code, invalidTagNameTooLongError.httpStatus);
		}
	}


	/**
	* Normalises a supplied webring name.
	* Ensures that a webring name is stored in a suitable format.
	* @param {string} name - The webring name to normalise.
	* @returns The normalised webring name.
	* @throws {InvalidTagNameError} This API returnable exception is raised in the case
	* that no username is provided.
	*/
	public static normaliseName(name: string): string
	{
		if (!name) {
			throw new InvalidTagNameError(invalidTagNameError.message,
				invalidTagNameError.code, invalidTagNameError.httpStatus);
		}

		return name.trim();
	}
}
