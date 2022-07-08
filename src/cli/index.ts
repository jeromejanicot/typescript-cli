import { AvailablePackages18 } from "../installers/index";
import chalk from "chalk";
import { Command } from "commander";
import { CREATE_TYPESCRIPT_APP, DEFAULT_APP_NAME } from "../consts";
import { getVersion } from "../utils/getCliVersion";
import inquirer from "inquirer";
import { logger } from "../utils/logger";
import { setPackageList } from "../utils/setPackageList";
import { validateAppName } from "../utils/validateAppNames";

interface CliFlags {
  noGit: boolean;
  noInstall: boolean;
  default: boolean;
}

interface CliResults {
  appName: string;
  appType: string;
  packages: AvailablePackages18[];
  flags: CliFlags;
}

const defaultOptions: CliResults = {
  appName: DEFAULT_APP_NAME,
  appType: "next",
  packages: ["nextAuth", "prisma", "tailwind", "trpc"],
  flags: {
    noGit: false,
    noInstall: false,
    default: false,
  },
};

export const runCli = async () => {
  const cliResults = defaultOptions;

  const commander = require("commander");
  const program = new Command().name(CREATE_TYPESCRIPT_APP);

  // will need to watch for typesafety
  program
    .description("A CLI for creating web applications with TypeScript")
    .argument(
      "[dir]",
      "The name of the application, as well as the name of the directory to create"
    )
    .addArgument(
      new commander.Argument(
        "[type]",
        "the type of the application to create, react or node"
      )
        .choices(["next", "node"])
        .action((type) => {
          if (!type) {
            return (type = "next");
          }
        })
    )
    .option(
      "--noGit",
      "Explicitly tell the CLI to not initialize a new git repo in the project",
      false
    )
    .option(
      "--noInstall",
      "Explicitly tell the CLI to not run the package manager's install command",
      false
    )
    .option(
      "-y, --default",
      "Bypass the CLI and use all default options to bootstrap a new t3-app",
      false
    )
    .version(getVersion(), "-v, --version", "Display the version number")
    .addHelpText(
      "afterAll",
      `\n A Cli to start Typescript projects. 
       \n Inpired by ${chalk.hex("#E24A8D").bold("create-t3-app")} at ${chalk
        .hex("#E24A8D")
        .underline("https://github.com/t3-oss/create-t3-app")} \n`
    )
    .parse(process.argv);

  // set availabelPackages in relation to type of project
  const cliProvidedType = program.args[1];
  if (cliProvidedType) {
    cliResults.appType = cliProvidedType;
  }

  // FIXME: TEMPORARY WARNING WHEN USING NODE 18. SEE ISSUE #59
  if (process.versions.node.startsWith("18") && cliResults.appType == "next") {
    logger.warn(`  WARNING: You are using Node.js version 18. This is currently not compatible with Next-Auth.
  If you want to use Next-Auth, switch to a previous version of Node, e.g. 16 (LTS).
  If you have nvm installed, use 'nvm install --lts' to switch to the latest LTS version of Node.
    `);

    cliResults.packages = cliResults.packages.filter(
      (val) => val !== "nextAuth"
    );
  }

  // !!!!! Needs to be seperated outside the if statement to correctly infer the type as string | undefined
  const cliProvidedName = program.args[0];
  if (cliProvidedName) {
    cliResults.appName = cliProvidedName;
  }

  cliResults.flags = program.opts();

  try {
    if (!cliResults.flags.default) {
      if (!cliProvidedName) {
        const { appName } = await inquirer.prompt<Pick<CliResults, "appName">>({
          name: "appName",
          type: "input",
          message: "What will your project be called?",
          default: defaultOptions.appName,
          validate: validateAppName,
          transformer: (input: string) => {
            return input.trim();
          },
        });
        cliResults.appName = appName;
      }

      const { packages } = await inquirer.prompt<Pick<CliResults, "packages">>({
        name: "packages",
        type: "checkbox",
        message: "Which packages would you like to enable?",
        choices:
          process.versions.node.startsWith("18") && cliResults.appType
            ? setPackageList(cliResults.appType)
            : setPackageList("next18").map((pkgName) => ({
                name: pkgName,
                checked: false,
              })),
      });

      cliResults.packages = packages;

      if (!cliResults.flags.noInstall) {
        const { runInstall } = await inquirer.prompt<{ runInstall: boolean }>({
          name: "runInstall",
          type: "confirm",
          message: "Would you like us to run npm install?",
          default: true,
        });

        if (runInstall) {
          logger.success("Alright. We'll install the dependencies for you!");
        } else {
          cliResults.flags.noInstall = true;
          logger.info(
            "No worries. You can run 'npm install' later to install the dependencies."
          );
        }
      }
    }
  } catch (err) {
    // If the user is not calling create-t3-app from an interactive terminal, inquirer will throw an error with isTTYError = true
    // If this happens, we catch the error, tell the user what has happened, and then continue to run the program with a default t3 app
    // eslint-disable-next-line -- Otherwise we have to do some fancy namespace extension logic on the Error type which feels overkill for one line
    if (err instanceof Error && (err as any).isTTYError) {
      logger.warn(
        `${CREATE_TYPESCRIPT_APP} needs an interactive terminal to provide options`
      );
      logger.info(`Bootstrapping a default t3 app in ./${cliResults.appName}`);
    } else {
      throw err;
    }
  }

  return cliResults;
};
