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
        whisperchain = await deployContract("IdentityManagement", [], { wallet: deployer , silent: true });
      });


  it("should allow an anonymous report submission", async function () {
    const reportContent = "This is an anonymous report.";
    const reportTag = "Corruption";

    // Submit a report
    const tx = await (whisperchain.connect(address1) as Contract).submitReport(reportContent, reportTag);

    // Wait for the transaction to be mined
    await tx.wait(); 

    // Retrieve the report using the emitted report ID
    const reportId = ethers.keccak256(
      new ethers.AbiCoder.encode(
        ["string", "string", "uint256", "address"],
        [reportContent, reportTag, (await ethers.getBlock()).timestamp, addr1.address]
      )
    );

    // Check that the report exists
    const report = await anonGuard.getReport(reportId);

    expect(report.content).to.equal(reportContent);
    expect(report.tag).to.equal(reportTag);
    expect(report.status).to.equal(0); // Pending
    expect(report.voteCount).to.equal(0);
    expect(report.comments).to.be.an("array").that.is.empty;
  });
})
