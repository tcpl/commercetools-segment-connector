import { getLogger } from '../utils/logger.utils';
import { readConfiguration } from '../utils/config.utils';

export const deleteUser = async (userId: string) => {
  const logger = getLogger();
  const configuration = readConfiguration();

  if (!configuration.segmentPublicApiToken) {
    logger.warn(
      `Segment Public API token not found in configuration. Cannot request user deletion for ${userId}`
    );
    return;
  }

  const response = await fetch(
    `${configuration.segmentPublicApiHost}/regulations`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${configuration.segmentPublicApiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        regulationType: 'SUPPRESS_WITH_DELETE',
        subjectType: 'USER_ID',
        subjectIds: [userId],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    const errorMessage = `Failed to delete user ID ${userId} in Segment. Status: ${response.status}, Response: ${errorText}`;

    logger.error(errorMessage);

    throw new Error(errorMessage);
  }

  const result = await response.json();
  logger.info(
    `Successfully requested user ID ${userId} be deleted in Segment. Regulate ID: ${result.regulateId}`
  );
};
