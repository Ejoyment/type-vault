#!/usr/bin/env node
import { Command } from 'commander';
import inquirer from 'inquirer';
import { scaffoldService } from './scaffold';
import chalk from 'chalk';

const program = new Command();

program
  .name('codex-scaffold')
  .description('CODEX INC - Zero-Trust Microservice Scaffolding Tool')
  .version('1.0.0');

program
  .command('new')
  .description('Create a new microservice')
  .action(async () => {
    console.log(chalk.blue.bold('\n🚀 CODEX INC Service Scaffolder\n'));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'serviceName',
        message: 'Service name:',
        validate: (input: string) => /^[a-z0-9-]+$/.test(input) || 'Use lowercase, numbers, and hyphens only'
      },
      {
        type: 'list',
        name: 'serviceType',
        message: 'Service type:',
        choices: ['api', 'worker', 'event-processor']
      },
      {
        type: 'input',
        name: 'port',
        message: 'Service port:',
        default: '3000',
        validate: (input: string) => !isNaN(Number(input)) || 'Must be a number'
      }
    ]);

    try {
      await scaffoldService(answers);
      console.log(chalk.green.bold('\n✅ Service scaffolded successfully!'));
      console.log(chalk.gray(`\nNext steps:\n  cd ${answers.serviceName}\n  npm install\n  npm run dev\n`));
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error);
      process.exit(1);
    }
  });

program.parse();
