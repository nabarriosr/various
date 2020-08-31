pragma solidity ^0.5.1;


import "./ownable.sol";


contract denuncias is Ownable {
    
    uint public count = 0;
    mapping(uint => string) denunciasHashLedger;
    mapping(uint => string) denunciasIdMongoLedger;
    
    
    function set(string memory _idMongoDB, string memory _denunciaHash) public returns(uint){ 
        count++;
        denunciasHashLedger[count] = _denunciaHash;
        denunciasIdMongoLedger[count] = _idMongoDB;
    }
    
    function get(uint _indexDenuncia) public view returns(string memory, string memory) {

        return (denunciasIdMongoLedger[_indexDenuncia], denunciasHashLedger[_indexDenuncia]);
    }
}