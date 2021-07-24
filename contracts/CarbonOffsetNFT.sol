// SPDX-License-Identifier: UNLISCENSED fixme confirm correct use

pragma solidity ^0.8.4;

import "../deps/npm/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../deps/npm/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "../deps/npm/@openzeppelin/contracts/utils/Counters.sol";
import "https://github.com/Uniswap/uniswap-v2-periphery/blob/master/contracts/interfaces/IUniswapV2Router02.sol";



//This token is non-transferrable since there is no reason for a user to transfer their token stating that their address is carbon offset
contract CarbonOffsetNFT is ERC721URIStorage {
    
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    IUniswapV2Router02 private uniswapRouter;
    address internal constant UNISWAP_ROUTER_ADDRESS = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    
    address private UPC02 = 0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa ; //currently multiDaiKovan, 0xaF9700FcA16276Cd69c4e35FEecC66D1116826cC is the mainnet address for UPC02
    
    event Mint(address indexed to, uint256 indexed tokenId);
    
    constructor() ERC721("CarbonOffsetNFT", "C02") {
        uniswapRouter = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
    }
    
        //Returns the totalSupply of NFTs
    function totalSupply() view public returns (uint256 _totalSupply) {
    return _tokenIds.current();
    }
    
    function mintNFT(string memory tokenURI) external payable returns (uint256) {
        
        
        //avg transaction is 0.0001809589427 kg C02 per unit of gas, this call costs 235126 gas, so 42.5kg c02 emitted by tx costing $0.42 at a price of $10 per ton
        //doesn't make sense to run this unless msg.value is greater than this amount, which is currently 
        require (msg.value > 0.00019662 ether);
        
            
        
        //Use the Uniswap ETH-UPC02 pool to exchange ETH for ETH-UPC02, which is sent to burn address    
        convertEthToC02(msg.value);
        
        
        //mint an NFT for the user as a recognition of their carbon offset
        _tokenIds.increment();
        
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI); //https://raw.githubusercontent.com/murrlincoln/CarbonOffsetNFT/main/NFTURI.json
        
        emit Mint(msg.sender, newItemId);
        
        
        return newItemId;
        //todo if possible: Allow the NFT to change its value based on the amount paid by the user
        
    }
    
    function convertEthToC02(uint256 ethAmount) internal {
        
        uint deadline = block.timestamp + 15;
        address burnAddress = 0x0000000000000000000000000000000000000000;
        
        
        uniswapRouter.swapExactETHForTokens{ value: ethAmount }(address(this).balance, getPathForETHtoC02(), burnAddress, deadline);

    }
    
    function getPathForETHtoC02() private view returns (address[] memory) {
    address[] memory path = new address[](2);
    path[0] = uniswapRouter.WETH();
    path[1] = UPC02;
    
    return path;
  }
    
    
}