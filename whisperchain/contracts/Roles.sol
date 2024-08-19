// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Roles {
    // Enum for roles
    enum Role { Admin, Reviewer }

    // Mapping to assign roles to addresses
    mapping(address => Role) public roles;

    // Event to log role assignment
    event RoleAssigned(address indexed user, Role role);

    // Modifier to restrict access to admins
    modifier onlyAdmin() {
        require(roles[msg.sender] == Role.Admin, "Not an admin");
        _;
    }

    // Modifier to restrict access to reviewers
    modifier onlyReviewer() {
        require(roles[msg.sender] == Role.Reviewer, "Not a reviewer");
        _;
    }

    // Constructor to initialize the contract owner as an Admin
    constructor() {
        roles[msg.sender] = Role.Admin; // The deployer is the default admin
    }

    // Function to assign a role to an address (only admins can assign roles)
    function assignRole(address _user, Role _role) external onlyAdmin {
        roles[_user] = _role;
        emit RoleAssigned(_user, _role);
    }
}
