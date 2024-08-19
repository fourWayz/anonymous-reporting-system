import { expect } from 'chai';
import { getWallet, deployContract, LOCAL_RICH_WALLETS } from '../deploy/utils';
import { Contract, ethers } from 'ethers';
import { Wallet } from 'zksync-ethers';

describe("AnonGuard Contract", function () {

    let whisperchain : Contract;
    let owner : Wallet;
    let address1 : Wallet;
    let address2 : Wallet;
    let deployer : Wallet


    before(async () => {
        deployer = getWallet(LOCAL_RICH_WALLETS[0].privateKey);
        address1 = getWallet(LOCAL_RICH_WALLETS[1].privateKey);
        address2 = getWallet(LOCAL_RICH_WALLETS[2].privateKey);
        owner = getWallet(LOCAL_RICH_WALLETS[3].privateKey);
        whisperchain = await deployContract("WhisperChain", [], { wallet: deployer , silent: true });
      });

    it("should allow an anonymous report submission", async function () {
        const reportContent = "This is an anonymous report.";
        const reportTag = "Corruption";

        // Submit a report
        const tx = await (whisperchain.connect(address1) as Contract).submitReport(reportContent, reportTag);

        // Wait for the transaction to be mined
        const receipt = await tx.wait(); 

        const log = receipt.logs.find(log => log.fragment?.name === "ReportSubmitted");

        const reportId = log.args[0];

          // Check that the report exists
        const report = await (whisperchain.connect(owner) as Contract).getReport(reportId);

        expect(report.content).to.equal(reportContent);
        expect(report.tag).to.equal(reportTag);
        expect(report.status.toString()).to.equal('0'); // Pending
        expect(report.voteCount.toString()).to.equal('0');
        expect(report.comments).to.be.an("array").that.is.empty;
    });

    it("should allow an admin to update report status", async function () {
        const reportContent = "This is an anonymous report.";
        const reportTag = "Fraud";
    
        // Submit a report
        const tx = await (whisperchain.connect(address2) as Contract).submitReport(reportContent, reportTag);

        // Wait for the transaction to be mined
        const receipt = await tx.wait(); 

        const log = receipt.logs.find(log => log.fragment?.name === "ReportSubmitted");

        const reportId = log.args[0];

        // Update the report status
        await (whisperchain.connect(deployer) as Contract).updateReportStatus(reportId, 1); // Reviewed
    
        // Check the updated report status
        const updatedReport = await  (whisperchain.connect(address2) as Contract).getReport(reportId);
        // console.log(updatedReport)
        expect(updatedReport.status.toString()).to.equal('1'); // Reviewed
      });

      it("should allow reviewers to add comments", async function () {
        const reportContent = "This is an anonymous report.";
        const reportTag = "Violation";
    
          // Submit a report
          const tx = await (whisperchain.connect(address2) as Contract).submitReport(reportContent, reportTag);

          // Wait for the transaction to be mined
          const receipt = await tx.wait(); 
  
          const log = receipt.logs.find(log => log.fragment?.name === "ReportSubmitted");
  
          const reportId = log.args[0];

            // Assign the reviewer role to addr2
              await (whisperchain.connect(deployer) as Contract).assignRole(address2.address, 1); // Reviewer
            // Add a comment as a reviewer
            await (whisperchain.connect(address2) as Contract).addComment(reportId, "This needs further investigation.");
        
            // Check the comments
            const report =  await (whisperchain.connect(deployer) as Contract).getReport(reportId);
            expect(report.comments[0]).to.equal("This needs further investigation.");
      });
})
