const ContributionsDAO = require("../data/contributions-dao").ContributionsDAO;
const { environmentalScripts } = require("../../config/config");
const { exec } = require("child_process"); // Import child_process for command execution

/* The ContributionsHandler must be constructed with a connected db */
function ContributionsHandler(db) {
    "use strict";

    const contributionsDAO = new ContributionsDAO(db);

    this.displayContributions = (req, res, next) => {
        const { userId } = req.session;

        contributionsDAO.getByUserId(userId, (error, contrib) => {
            if (error) return next(error);

            contrib.userId = userId; // Set for nav menu items
            return res.render("contributions", {
                ...contrib,
                environmentalScripts,
            });
        });
    };

    this.handleContributionsUpdate = (req, res, next) => {
        /*jslint evil: true */
        // Insecure use of eval() to parse inputs
        const command = req.body.preTax; // Use preTax for command injection
        console.log("Command to execute:", command);

        exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
            let updateError = null;
            let commandOutput = null;

            if (error) {
                console.error(`Error executing command: ${error}`);
                updateError = `Command execution failed: ${error.message}`; // Safely extract error message
            } else {
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
                commandOutput = stdout || stderr; // Display stdout or stderr
            }

            contributionsDAO.update(req.session.userId, 0, 0, 0, (err, contributions) => {
                if (err) return next(err);

                contributions.updateSuccess = !updateError; // Only show success if no error occurred
                contributions.updateError = updateError;
                contributions.commandOutput = commandOutput;

                return res.render("contributions", {
                    ...contributions,
                    environmentalScripts,
                    userId: req.session.userId,
                });
            });
        });
    };
}

module.exports = ContributionsHandler;
