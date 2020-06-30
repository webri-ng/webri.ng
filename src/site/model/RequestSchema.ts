/**
 * @type Request validation schema.
 * Type alias for request validation schemas.
 * @todo Integrate a more concrete type if a package becomes available.
 */

/** Request validation schema type. */
export interface RequestSchema {
	$schema: string;
	type: string;
	properties: Record<string, unknown>,
	required?: Array<string>,
	additionalProperties?: boolean
}
