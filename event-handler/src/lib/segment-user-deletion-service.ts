import {
  configureApis,
  CreateWorkspaceRegulationV1Input,
  unwrap,
} from '@segment/public-api-sdk-typescript';
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

  const api = configureApis(configuration.segmentPublicApiToken);

  try {
    const regulationType =
      CreateWorkspaceRegulationV1Input.RegulationTypeEnum.SUPPRESS_WITH_DELETE;
    const subjectType =
      CreateWorkspaceRegulationV1Input.SubjectTypeEnum.USER_ID;
    const subjectIds = [userId];

    const result = await unwrap(
      api.deletionAndSuppresion.createWorkspaceRegulation({
        regulationType,
        subjectType,
        subjectIds,
      })
    );

    logger.info(
      `Successfully requested user ID ${userId} be deleted in Segment. Regulate ID: ${result.regulateId}`
    );
  } catch (e) {
    logger.error(`Error deleting user ID ${userId} in Segment`, e);
  }
};
