import chalk from 'chalk';
import commander from 'commander';
import * as path from 'path';
import * as fs from 'fs';
import {
    getConnection, runSeeder, setConnection
} from 'typeorm-seeding';

// Cli helper
commander
  .version('1.0.0')
  .description('Run database seeds of your project')
  .option('-L, --logging', 'enable sql query logging')
  .option('--factories <path>', 'add filepath for your factories')
  .option('--seeds <path>', 'add filepath for your seeds')
  .option('--run <seeds>', 'run specific seeds (file names without extension)', (val) => val.split(','))
  .option('--config <file>', 'path to your ormconfig.json file (must be a json)')
  .parse(process.argv);

// Get cli parameter for a different factory path
const factoryPath = path.join(__dirname, '/../src/database/factories/');

// Get cli parameter for a different seeds path
const seedsPath = path.join(__dirname, '/../src/database/seeds/');

// Get a list of seeds
const listOfSeeds = (commander.run)
  ? commander.run.map(l => l.trim()).filter(l => l.length > 0)
  : [];

// Search for seeds and factories
const run = async () => {
  const log = console.log;

  const factoryFiles = [];
  const seedFiles = [];
  try {
      console.log("in try block")
      console.log(factoryPath)
    await fs.readdir(factoryPath, (err: any, files: any) => {
        // handling error
        console.log("Reached factory files")
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        // listing all files using forEach
        console.log(files);
        files.forEach((file) => {
            // Do whatever you want to do with the file
            factoryFiles.push(file);
            console.log(file)
        });
    });
      console.log(factoryFiles)
    fs.readdir(seedsPath, (err: any, files: any) => {
        // handling error
        console.log("Reached seeds files")
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        // listing all files using forEach
        files.forEach((file) => {
            // Do whatever you want to do with the file
            seedFiles.push(file);
        });
    });
      console.log(seedFiles)
  } catch (error) {
    return handleError(error);
  }

  // Filter seeds
  if (listOfSeeds.length > 0) {
    seedFiles = seedFiles.filter(sf => listOfSeeds.indexOf(path.basename(sf).replace('.ts', '')) >= 0);
  }

  // Status logging to print out the amount of factories and seeds.
  log(chalk.bold('seeds'));
  log('🔎 ', chalk.gray.underline(`found:`),
    chalk.blue.bold(`${factoryFiles.length} factories`, chalk.gray('&'), chalk.blue.bold(`${seedFiles.length} seeds`)));

  // Get database connection and pass it to the seeder
  try {
      console.log("reached conn")
    const connection = await getConnection();
    setConnection(connection);
  } catch (error) {
    return handleError(error);
  }

  // Show seeds in the console
  for (const seedFile of seedFiles) {
    try {
      let className = seedFile.split('/')[seedFile.split('/').length - 1];
      className = className.replace('.ts', '').replace('.js', '');
      className = className.split('-')[className.split('-').length - 1];
      log('\n' + chalk.gray.underline(`executing seed:  `), chalk.green.bold(`${className}`));
      const seedFileObject: any = require(seedFile);
      await runSeeder(seedFileObject[className]);
    } catch (error) {
      console.error('Could not run seed ', error);
      process.exit(1);
    }
  }

  log('\n👍 ', chalk.gray.underline(`finished seeding`));
  process.exit(0);
};

const handleError = (error) => {
  console.error(error);
  process.exit(1);
};

run();
