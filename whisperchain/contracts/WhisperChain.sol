// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Roles.sol";

contract WhisperChain is Roles {
    // Enum for report status
    enum ReportStatus { Pending, Reviewed, Resolved, Escalated }

    // Structure to hold report details
    struct Report {
        string content;          // Encrypted report content
        string tag;              // Category or tag for the report
        uint256 timestamp;       // Timestamp of the report submission
        ReportStatus status;     // Current status of the report
        uint256 voteCount;       // Count of positive votes from reviewers
        string[] comments;       // Array of comments by reviewers or admin
    }

    // Mapping to store reports with a unique hash identifier
    mapping(bytes32 => Report) private reports;

    // Contract owner
    address public owner;

    // Event to log the submission of anonymous reports
    event ReportSubmitted(bytes32 reportId, string tag, uint256 timestamp);
    event ReportStatusUpdated(bytes32 reportId, ReportStatus newStatus);
    event ReportCommentAdded(bytes32 reportId, address commenter, string comment);
    event ReportVoted(bytes32 reportId, address voter, uint256 voteCount);
    event BountyClaimed(bytes32 reportId, address claimant, uint256 bounty);

    // Constructor to initialize the contract owner
    constructor() {
        owner = msg.sender;
    }

    // Function to submit an anonymous report with a tag
    function submitReport(string memory _reportContent, string memory _tag) external {
        bytes32 reportId = keccak256(abi.encodePacked(_reportContent, _tag, block.timestamp, msg.sender));
        reports[reportId] = Report({
            content: _reportContent,
            tag: _tag,
            timestamp: block.timestamp,
            status: ReportStatus.Pending,
            voteCount: 0,
            comments:  new string[](0)
        });

        emit ReportSubmitted(reportId, _tag, block.timestamp);
    }

    // Function to retrieve a report by ID (restricted to admins)
    function getReport(bytes32 _reportId) external view onlyAdmin returns (Report memory) {
        require(bytes(reports[_reportId].content).length > 0, "Report does not exist");
        return reports[_reportId];
    }

    // Function to update the status of a report (only admin)
    function updateReportStatus(bytes32 _reportId, ReportStatus _newStatus) external onlyAdmin {
        require(bytes(reports[_reportId].content).length > 0, "Report does not exist");
        reports[_reportId].status = _newStatus;

        emit ReportStatusUpdated(_reportId, _newStatus);
    }

    // Function to add a comment to a report (admin or reviewer)
    function addComment(bytes32 _reportId, string memory _comment) external onlyReviewer {
        require(bytes(reports[_reportId].content).length > 0, "Report does not exist");
        reports[_reportId].comments.push(_comment);

        emit ReportCommentAdded(_reportId, msg.sender, _comment);
    }

    // Function for reviewers to vote on a report
    function voteOnReport(bytes32 _reportId) external onlyReviewer {
        require(bytes(reports[_reportId].content).length > 0, "Report does not exist");
        reports[_reportId].voteCount += 1;

        emit ReportVoted(_reportId, msg.sender, reports[_reportId].voteCount);
    }

    // Function to escalate a report (admin only)
    function escalateReport(bytes32 _reportId) external onlyAdmin {
        require(bytes(reports[_reportId].content).length > 0, "Report does not exist");
        reports[_reportId].status = ReportStatus.Escalated;

        emit ReportStatusUpdated(_reportId, ReportStatus.Escalated);
    }

    // Function to set bounty for a report (admin only)
    function setBounty(bytes32 _reportId, uint256 _bounty) external onlyAdmin payable {
        require(bytes(reports[_reportId].content).length > 0, "Report does not exist");
        require(msg.value == _bounty, "Insufficient bounty amount");

        // Bounty is sent along with the transaction to the report
    }

    // Function to claim bounty for a verified report (reporter claims it)
    function claimBounty(bytes32 _reportId) external {
        require(bytes(reports[_reportId].content).length > 0, "Report does not exist");
        require(reports[_reportId].status == ReportStatus.Resolved, "Report not resolved yet");

        uint256 bountyAmount = address(this).balance;
        payable(msg.sender).call{value : bountyAmount}("");

        emit BountyClaimed(_reportId, msg.sender, bountyAmount);
    }
   
}
