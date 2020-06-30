import { getUser, GetUserSearchField } from '..';
import { userNotFoundError } from '../../../api/api-error-response';
import { User, UUID } from '../../../model';
import { UserNotFoundError } from '../../error';

export async function requestPasswordReset(userId: Readonly<UUID>): Promise<void>
{
	const user: User | null = await getUser(GetUserSearchField.UserId, userId);
	if (!user) {
		throw new UserNotFoundError(`User with id '${userId}' cannot be found`,
			userNotFoundError.code, userNotFoundError.httpStatus);
	}


}
