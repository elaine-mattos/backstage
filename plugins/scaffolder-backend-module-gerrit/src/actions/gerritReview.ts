/*
 * Copyright 2022 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import crypto from 'crypto';
import { InputError } from '@backstage/errors';
import { Config } from '@backstage/config';
import { ScmIntegrationRegistry } from '@backstage/integration';
import {
  commitAndPushRepo,
  createTemplateAction,
  getRepoSourceDirectory,
  parseRepoUrl,
} from '@backstage/plugin-scaffolder-node';
import { examples } from './gerritReview.examples';

const generateGerritChangeId = (): string => {
  const changeId = crypto.randomBytes(20).toString('hex');
  return `I${changeId}`;
};

/**
 * Creates a new action that creates a Gerrit review
 * @public
 */
export function createPublishGerritReviewAction(options: {
  integrations: ScmIntegrationRegistry;
  config: Config;
}) {
  const { integrations, config } = options;

  return createTemplateAction({
    id: 'publish:gerrit:review',
    description: 'Creates a new Gerrit review.',
    examples,
    schema: {
      input: {
        repoUrl: z =>
          z.string({
            description: 'Repository Location',
          }),
        branch: z =>
          z
            .string({
              description:
                'Branch of the repository the review will be created on',
            })
            .optional(),
        sourcePath: z =>
          z
            .string({
              description:
                'Subdirectory of working directory containing the repository',
            })
            .optional(),
        gitCommitMessage: z =>
          z
            .string({
              description: `Sets the commit message on the repository.`,
            })
            .optional(),
        gitAuthorName: z =>
          z
            .string({
              description: `Sets the default author name for the commit. The default value is 'Scaffolder'`,
            })
            .optional(),
        gitAuthorEmail: z =>
          z
            .string({
              description: `Sets the default author email for the commit.`,
            })
            .optional(),
        signCommit: z =>
          z
            .boolean({
              description: 'Sign commit with configured PGP private key',
            })
            .optional(),
      },
      output: {
        reviewUrl: z =>
          z
            .string({
              description: 'A URL to the review',
            })
            .optional(),
        repoContentsUrl: z =>
          z
            .string({
              description: 'A URL to the root of the repository',
            })
            .optional(),
      },
    },
    async handler(ctx) {
      const {
        repoUrl,
        branch = 'master',
        sourcePath,
        gitAuthorName,
        gitAuthorEmail,
        gitCommitMessage,
        signCommit,
      } = ctx.input;
      const { host, repo } = parseRepoUrl(repoUrl, integrations);

      if (!gitCommitMessage) {
        throw new InputError(`Missing gitCommitMessage input`);
      }

      const integrationConfig = integrations.gerrit.byHost(host);

      if (!integrationConfig) {
        throw new InputError(
          `No matching integration configuration for host ${host}, please check your integrations config`,
        );
      }

      const auth = {
        username: integrationConfig.config.username!,
        password: integrationConfig.config.password!,
      };
      const gitAuthorInfo = {
        name: gitAuthorName
          ? gitAuthorName
          : config.getOptionalString('scaffolder.defaultAuthor.name'),
        email: gitAuthorEmail
          ? gitAuthorEmail
          : config.getOptionalString('scaffolder.defaultAuthor.email'),
      };
      const signingKey =
        integrationConfig.config.commitSigningKey ??
        config.getOptionalString('scaffolder.defaultCommitSigningKey');
      if (signCommit && !signingKey) {
        throw new Error(
          'Signing commits is enabled but no signing key is provided in the configuration',
        );
      }
      const changeId = generateGerritChangeId();
      const commitMessage = `${gitCommitMessage}\n\nChange-Id: ${changeId}`;

      await commitAndPushRepo({
        dir: getRepoSourceDirectory(ctx.workspacePath, sourcePath),
        auth,
        logger: ctx.logger,
        commitMessage,
        gitAuthorInfo,
        branch,
        remoteRef: `refs/for/${branch}`,
        signingKey: signCommit ? signingKey : undefined,
      });

      const repoContentsUrl = `${integrationConfig.config.gitilesBaseUrl}/${repo}/+/refs/heads/${branch}`;
      const reviewUrl = `${integrationConfig.config.baseUrl}/#/q/${changeId}`;
      ctx.logger?.info(`Review available on ${reviewUrl}`);
      ctx.output('repoContentsUrl', repoContentsUrl);
      ctx.output('reviewUrl', reviewUrl);
    },
  });
}
