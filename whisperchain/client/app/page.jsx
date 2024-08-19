import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { BrowserProvider } from 'zksync-ethers';
import Header from '../app/components/Header';
import ReportForm from '../app/components/ReportForm';
import ReportList from '../app/components/ReportList';

export default function Home() {
  const [reports, setReports] = useState([]);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (typeof window !== 'undefined') {
        const provider = new BrowserProvider(window.ethereum);
        const signer = provider.getSigner();

      // deployed contract addresss and ABI
      const contractAddress = require('../variables/address.json');
      const contractABI = require('../variables/abi.json')
      const paymasterAddress = require('../variables/paymaster.json')

      const whisperChain = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(whisperChain);
    };
  }
    init();
  }, []);

  const fetchReports = async () => {
    if (contract) {
     
    }
  };

  useEffect(() => {
    fetchReports();
  }, [contract]);

  const submitReport = async (content, tag) => {
    if (contract) {
      const tx = await contract.submitReport(content, tag);
      await tx.wait();
      fetchReports();
    }
  };

  const addComment = async (reportId, comment) => {
    if (contract) {
      const tx = await contract.addComment(reportId, comment);
      await tx.wait();
      fetchReports();
    }
  };

  const updateStatus = async (reportId, status) => {
    if (contract) {
      const tx = await contract.updateReportStatus(reportId, status);
      await tx.wait();
      fetchReports();
    }
  };

  return (
    <div>
      <Header />
      <main className="container mx-auto mt-8">
        <ReportForm submitReport={submitReport} />
        <ReportList reports={reports} addComment={addComment} updateStatus={updateStatus} />
      </main>
    </div>
  );
}
