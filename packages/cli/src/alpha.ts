/*
 * Copyright 2024 The Backstage Authors
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

import { CliInitializer } from './wiring/CliInitializer';
import chalk from 'chalk';

(async () => {
  // Logging as stdout to prevent failures from stderr during api-report generation.
  console.log(
    chalk.yellow(
      'THIS ENTRYPOINT IS IN ALPHA AND MAY CHANGE IN THE FUTURE - DO NOT USE THIS FOR NORMAL DEVELOPMENT',
    ),
  );
  const initializer = new CliInitializer();
  initializer.add(import('./modules/build/alpha'));
  initializer.add(import('./modules/config/alpha'));
  initializer.add(import('./modules/create-github-app/alpha'));
  initializer.add(import('./modules/info/alpha'));
  initializer.add(import('./modules/lint/alpha'));
  initializer.add(import('./modules/maintenance/alpha'));
  initializer.add(import('./modules/migrate/alpha'));
  initializer.add(import('./modules/new/alpha'));
  initializer.add(import('./modules/test/alpha'));
  await initializer.run();
})();
