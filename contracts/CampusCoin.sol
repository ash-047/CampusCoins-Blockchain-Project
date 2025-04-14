// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CampusCoin {
    string public name = "CampusCoin";
    string public symbol = "CC";
    uint8 public decimals = 0;
    uint256 public totalSupply = 0;
    
    address public admin;
    mapping(address => uint256) public balanceOf;
    mapping(address => bool) public isOrganizer;
    mapping(address => bool) public isCanteenStaff;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Mint(address indexed to, uint256 value);
    event Reward(address indexed organizer, address indexed student, uint256 value, string reason);
    event Redeem(address indexed student, address indexed canteen, uint256 value);
    event Slash(address indexed student, uint256 value, string reason);
    
    constructor() {
        admin = msg.sender;
    }
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier onlyOrganizer() {
        require(isOrganizer[msg.sender] || msg.sender == admin, "Only organizers can perform this action");
        _;
    }
    
    modifier onlyCanteen() {
        require(isCanteenStaff[msg.sender] || msg.sender == admin, "Only canteen staff can perform this action");
        _;
    }
    
    function setOrganizer(address _organizer, bool _status) external onlyAdmin {
        isOrganizer[_organizer] = _status;
    }
    
    function setCanteenStaff(address _staff, bool _status) external onlyAdmin {
        isCanteenStaff[_staff] = _status;
    }
    
    function mint(address _to, uint256 _amount) external onlyAdmin {
        balanceOf[_to] += _amount;
        totalSupply += _amount;
        emit Mint(_to, _amount);
        emit Transfer(address(0), _to, _amount);
    }
    
    function rewardStudent(address _student, uint256 _amount, string memory _reason) external onlyOrganizer {
        require(_student != address(0), "Invalid student address");
        require(_amount > 0, "Amount must be greater than zero");
        require(balanceOf[msg.sender] >= _amount, "Insufficient balance to reward");
        
        balanceOf[msg.sender] -= _amount;
        balanceOf[_student] += _amount;
        
        emit Reward(msg.sender, _student, _amount, _reason);
        emit Transfer(msg.sender, _student, _amount);
    }
    
    function redeemTokens(address _student, uint256 _amount) external onlyCanteen {
        require(balanceOf[_student] >= _amount, "Student has insufficient balance");
        balanceOf[_student] -= _amount;
        balanceOf[msg.sender] += _amount;
        emit Redeem(_student, msg.sender, _amount);
        emit Transfer(_student, msg.sender, _amount);
    }
    
    function slashTokens(address _student, uint256 _amount, string memory _reason) external onlyAdmin {
        require(balanceOf[_student] >= _amount, "Student has insufficient balance");
        balanceOf[_student] -= _amount;
        totalSupply -= _amount;
        emit Slash(_student, _amount, _reason);
        emit Transfer(_student, address(0), _amount);
    }
    
    function transfer(address _to, uint256 _amount) external returns (bool) {
        require(balanceOf[msg.sender] >= _amount, "Insufficient balance");
        balanceOf[msg.sender] -= _amount;
        balanceOf[_to] += _amount;
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }
}
