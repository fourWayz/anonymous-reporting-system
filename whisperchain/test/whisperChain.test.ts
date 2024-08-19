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
        expect(report.status).to.equal(0); // Pending
        expect(report.voteCount).to.equal(0);
        expect(report.comments).to.be.an("array").that.is.empty;
    });
})
