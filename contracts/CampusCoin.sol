// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CampusCoin {
    string public name = "CampusCoin";
    string public symbol = "CPC";
    uint8 public decimals = 18;
    uint256 public totalSupply = 0;

    mapping(address => uint256) public balanceOf;
    
    // Role mappings
    address public admin;
    mapping(address => bool) public isEventOrganizer;
    mapping(address => bool) public isCanteenStaff;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event TokensMinted(address indexed to, uint256 amount);
    event TokensRewarded(address indexed to, uint256 amount, string reason);
    event TokensRedeemed(address indexed from, uint256 amount, string item);
    event TokensSlashed(address indexed from, uint256 amount, string reason);
    
    constructor(address[] memory _organizers, address[] memory _canteenStaff) {
        admin = msg.sender;
        
        // Set organizers
        for (uint i = 0; i < _organizers.length; i++) {
            isEventOrganizer[_organizers[i]] = true;
        }
        
        // Set canteen staff
        for (uint i = 0; i < _canteenStaff.length; i++) {
            isCanteenStaff[_canteenStaff[i]] = true;
        }
        
        // Mint initial tokens to admin - 1000 CPC
        uint256 initialSupply = 1000 * 10**uint256(decimals);
        balanceOf[admin] = initialSupply;
        totalSupply = initialSupply;
        emit Transfer(address(0), admin, initialSupply);
        
        // Also mint 200 tokens to each organizer so they can reward students
        uint256 organizerAmount = 200 * 10**uint256(decimals);
        for (uint i = 0; i < _organizers.length; i++) {
            balanceOf[_organizers[i]] = organizerAmount;
            totalSupply += organizerAmount;
            emit Transfer(address(0), _organizers[i], organizerAmount);
        }
    }
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    modifier onlyEventOrganizer() {
        require(isEventOrganizer[msg.sender], "Only event organizers can call this function");
        _;
    }
    
    modifier onlyCanteenStaff() {
        require(isCanteenStaff[msg.sender], "Only canteen staff can call this function");
        _;
    }
    
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
    
    // Admin functions
    function mint(address _to, uint256 _amount) public onlyAdmin {
        balanceOf[_to] += _amount;
        totalSupply += _amount;
        emit TokensMinted(_to, _amount);
        emit Transfer(address(0), _to, _amount);
    }
    
    function slashTokens(address _from, uint256 _amount, string memory _reason) public onlyAdmin {
        require(balanceOf[_from] >= _amount, "Insufficient balance to slash");
        balanceOf[_from] -= _amount;
        totalSupply -= _amount;
        emit TokensSlashed(_from, _amount, _reason);
        emit Transfer(_from, address(0), _amount);
    }
    
    // Event organizer functions
    function rewardTokens(address _student, uint256 _amount, string memory _reason) public onlyEventOrganizer {
        require(balanceOf[msg.sender] >= _amount, "Insufficient balance to reward");
        balanceOf[msg.sender] -= _amount;
        balanceOf[_student] += _amount;
        emit TokensRewarded(_student, _amount, _reason);
        emit Transfer(msg.sender, _student, _amount);
    }
    
    // Canteen staff functions
    function redeemTokens(address _from, uint256 _amount, string memory _item) public onlyCanteenStaff {
        require(balanceOf[_from] >= _amount, "Student has insufficient balance");
        balanceOf[_from] -= _amount;
        balanceOf[msg.sender] += _amount;
        emit TokensRedeemed(_from, _amount, _item);
        emit Transfer(_from, msg.sender, _amount);
    }
}
