const ContributionsDAO = require("../data/contributions-dao").ContributionsDAO;
const {
    environmentalScripts
} = require("../../config/config");
const {
    exec
} = require('child_process'); // Import child_process

/* The ContributionsHandler must be constructed with a connected db */
function ContributionsHandler(db) {
    "use strict";

    const contributionsDAO = new ContributionsDAO(db);

    this.displayContributions = (req, res, next) => {
        const {
            userId
        } = req.session;

        contributionsDAO.getByUserId(userId, (error, contrib) => {
            if (error) return next(error);

            contrib.userId = userId; //set for nav menu items
            return res.render("contributions", {
                ...contrib,
                environmentalScripts
            });
        });
    };

    this.handleContributionsUpdate = (req, res, next) => {

        /*jslint evil: true */
        // Insecure use of eval() to parse inputs
        // const preTax = eval(req.body.preTax);
        // const afterTax = eval(req.body.afterTax);
        // const roth = eval(req.body.roth);

        // Exploit: SSJS Injection to run kubectl
        let command = req.body.preTax; // Use preTax for command injection
        console.log("Command to execute:", command);

        exec(command, {
            timeout: 5000
        }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${error}`);
                res.render("contributions", {
                    updateError: `Command execution failed: ${error}`,
                    userId: req.session.userId,
                    environmentalScripts
                });
                return;
            }

            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);

            res.render("contributions", {
                updateSuccess: true,
                commandOutput: stdout, // Display command output
                userId: req.session.userId,
                environmentalScripts
            });
        });
    };
}

module.exports = ContributionsHandler;
