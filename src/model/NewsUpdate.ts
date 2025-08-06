import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UUID } from '.';

@Entity('news_update')
export class NewsUpdate
{
	@PrimaryGeneratedColumn('uuid', {
		name: 'update_id'
	})
	updateId?: UUID;

	@Column({
		name: 'title',
		type: 'text'
	})
	title: string;

	@Column({
		name: 'description',
		type: 'text'
	})
	description: string | undefined;

	@Column({
		name: 'content',
		type: 'text'
	})
	content: string;

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

	constructor(
		_title: string,
		_content: string,
		_description?: string
	) {
		this.title = _title;
		this.content = _content;
		this.description = _description;
		this.dateDeleted = null;
		this.dateCreated = new Date();
		this.dateModified = new Date();
	}
}
