import dotenv from "dotenv";
dotenv.config();

import { createApiRoot } from "../client/create.client";
import { createSubscription } from "./actions";
import { getLogger } from "../utils/logger.utils";

const CONNECT_GCP_TOPIC_NAME_KEY = "CONNECT_GCP_TOPIC_NAME";
const CONNECT_GCP_PROJECT_ID_KEY = "CONNECT_GCP_PROJECT_ID";

async function postDeploy(properties: Map<string, unknown>): Promise<void> {
  const topicName = properties.get(CONNECT_GCP_TOPIC_NAME_KEY) as string;
  const projectId = properties.get(CONNECT_GCP_PROJECT_ID_KEY) as string;

  const apiRoot = createApiRoot();
  await createSubscription(apiRoot, topicName, projectId);
}

export async function run(): Promise<void> {
  const logger = getLogger(false);

  try {
    logger.info("Running post-deploy...");
    const properties = new Map(Object.entries(process.env));
    await postDeploy(properties);
    logger.info("Successfully completed post-deploy...");
  } catch (error) {
    logger.error("Post-deploy failed:", error);
    process.exitCode = 1;
  }
}

run();
