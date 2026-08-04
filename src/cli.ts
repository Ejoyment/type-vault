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
  .option('-n, --service-name <name>', 'Service name')
  .option('-t, --service-type <type>', 'Service type (api|worker|event-processor)')
  .option('-p, --port <port>', 'Service port', '3000')
  .action(async (options) => {
    console.log(chalk.blue.bold('\n🚀 CODEX INC Service Scaffolder\n'));

    const questions: Array<inquirer.Question | inquirer.ListQuestion<any>> = [];
    const serviceName = options.serviceName;
    const serviceType = options.serviceType;
    const port = options.port;

    if (!serviceName) {
      questions.push({
        type: 'input',
        name: 'serviceName',
        message: 'Service name:',
        validate: (input: string) => /^[a-z0-9-]+$/.test(input) || 'Use lowercase, numbers, and hyphens only'
      });
    }

    if (!serviceType) {
      questions.push({
        type: 'list',
        name: 'serviceType',
        message: 'Service type:',
        choices: ['api', 'worker', 'event-processor']
      });
    }

    if (!port) {
      questions.push({
        type: 'input',
        name: 'port',
        message: 'Service port:',
        default: '3000',
        validate: (input: string) => !isNaN(Number(input)) || 'Must be a number'
      });
    }

    const answers = questions.length > 0 ? await inquirer.prompt<any>(questions) : {};
    const config = {
      serviceName: serviceName || answers.serviceName,
      serviceType: serviceType || answers.serviceType,
      port: port || answers.port || '3000'
    };

    if (!config.serviceName || !config.serviceType || !config.port) {
      console.error(chalk.red('❌ Error: Missing required options.'));
      process.exit(1);
    }

    try {
      await scaffoldService(config);
      console.log(chalk.green.bold('\n✅ Service scaffolded successfully!'));
      console.log(chalk.gray(`\nNext steps:\n  cd ${config.serviceName}\n  npm install\n  npm run dev\n`));
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error);
      process.exit(1);
    }
  });

program.parse();
