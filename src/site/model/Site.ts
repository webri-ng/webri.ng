import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UUID } from '.';
import { invalidSiteNameError, invalidSiteNameTooLongError, invalidSiteNameTooShortError,
	invalidSiteUrlError } from '../api/api-error-response';
import { InvalidSiteNameError, InvalidSiteUrlError } from '../app/error';
import { webringConfig } from '../config';

@Entity('site')
export class Site
{
	@PrimaryGeneratedColumn('uuid', {
		name: 'site_id'
	})
	public siteId?: UUID;

	@Column({
		name: 'name',
		type: 'text',
		nullable: true
	})
	public name: string;

	@Column({
		name: 'url',
		type: 'text'
	})
	public url: string;

	@Column({
		name: 'ring_id',
		type: 'uuid'
	})
	public parentWebringId: UUID;

	@Column({
		name: 'added_by',
		type: 'uuid'
	})
	public addedBy: UUID;

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

	constructor(_name: string,
		_url: string,
		_parentWebringId: UUID,
		_addedBy: UUID)
	{
		this.name = _name;
		this.url = _url;
		this.addedBy = _addedBy;
		this.parentWebringId = _parentWebringId;
		this.dateDeleted = null;
		this.dateCreated = new Date();
		this.dateModified = new Date();
	}

	/**
	 * Validates a site name.
	 * Throws a descriptive exception in case of validation failure.
	 * @param {string} name - The name to validate.
	 * @throws {InvalidSiteNameError} This API returnable exception is raised with a
	 * detailed error message in the case of a validation failure.
	 */
	public static validateName(name: string): void
	{
		if (!name) {
			throw new InvalidSiteNameError(invalidSiteNameError.message,
				invalidSiteNameError.code, invalidSiteNameError.httpStatus);
		}

		// Check name length.
		if (name.length < webringConfig.nameRequirements.minLength) {
			throw new InvalidSiteNameError(invalidSiteNameTooShortError.message,
				invalidSiteNameTooShortError.code, invalidSiteNameTooShortError.httpStatus);
		}

		if (name.length > webringConfig.nameRequirements.maxLength) {
			throw new InvalidSiteNameError(invalidSiteNameTooLongError.message,
				invalidSiteNameTooLongError.code, invalidSiteNameTooLongError.httpStatus);
		}
	}


	/**
	* Normalises a supplied site name.
	* Ensures that a site name is stored in a suitable format.
	* @param {string} name - The site name to normalise.
	* @returns The normalised site name.
	* @throws {InvalidSiteNameError} This API returnable exception is raised in the case
	* that no site name is provided.
	*/
	public static normaliseName(name: string): string
	{
		if (!name) {
			throw new InvalidSiteNameError(invalidSiteNameError.message,
				invalidSiteNameError.code, invalidSiteNameError.httpStatus);
		}

		return name.trim();
	}

	/**
	 * Validates a site URL.
	 * @param {string} name - The site URL to validate.
	 * @throws {InvalidSiteUrlError} This API returnable exception is raised in the case
	 * that the provided URL is invalid.
	 */
	public static validateUrl(url: string): void
	{
		if (!url) {
			throw new InvalidSiteUrlError(invalidSiteUrlError.message,
				invalidSiteUrlError.code, invalidSiteUrlError.httpStatus);
		}
	}

	/**
	* Normalises a supplied site URL.
	* Ensures that a site URL is stored in a suitable format.
	* @param {string} url - The site URL to normalise.
	* @returns The normalised site URL.
	* @throws {InvalidSiteNameError} This API returnable exception is raised in the case
	* that no username is provided.
	*/
	public static normaliseUrl(url: string): string
	{
		if (!url) {
			throw new InvalidSiteUrlError(invalidSiteUrlError.message,
				invalidSiteUrlError.code, invalidSiteUrlError.httpStatus);
		}

		let normalisedUrl = url.toLowerCase().trim();

		// If the site URL provided is not prefixed with a valid protocol identifier,
		// add a HTTP protocol prefix.
		if (!/^(\w)+?:\/\//.test(normalisedUrl)) {
			normalisedUrl = `http://${normalisedUrl}`;
		}

		return normalisedUrl;
	}
}
