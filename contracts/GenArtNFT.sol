// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.0;

// We first import some OpenZeppelin Contracts.
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";
import {Base64} from "./libraries/Base64.sol";

contract GenArtNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    string baseSvg =
        "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='black' /><text x='50%' y='50%' class='base' dominant-baseline='middle' text-anchor='middle'>";
    uint256 maxNFTnum = 50;

    // We need to pass the name of our NFTs token and it's symbol.
    constructor() ERC721("SquareNFT", "SQUARE") {
        console.log(
            "This line should be printed when the contract is deployed"
        );
    }

    string[20] adjectives = [
        "Adorable",
        "Arrogant",
        "Bewildered",
        "Charming",
        "Creepy",
        "Depressed",
        "Embarrassed",
        "Excited",
        "Fantastic",
        "Frightened",
        "Friendly",
        "Glorious",
        "Helpless",
        "Lonely",
        "Precious",
        "Powerful",
        "Sleepy",
        "Stupid",
        "Talented",
        "Vivacious"
    ];
    string[20] colours = [
        "Violet",
        "Indigo",
        "Blue",
        "Green",
        "Yellow",
        "Orange",
        "Red",
        "Cyan",
        "Black",
        "White",
        "Purple",
        "Mint",
        "Pink",
        "Lime",
        "Grey",
        "Golden",
        "Silver",
        "Teal",
        "Aqua",
        "Navy"
    ];
    string[20] animals = [
        "Lion",
        "Tiger",
        "Cat",
        "Dog",
        "Horse",
        "Elephant",
        "Pig",
        "Panda",
        "Sloth",
        "Monkey",
        "Fox",
        "Goat",
        "Sheep",
        "Camel",
        "Giraffe",
        "Deer",
        "Kangaroo",
        "Rabbit",
        "Zebra",
        "Mouse"
    ];

    event NewGenArtNFTMinted(address sender, uint256 tokenId);

    function pickRandomAdjective(uint256 tokenId)
        public
        view
        returns (string memory)
    {
        uint256 rand = random(
            string(abi.encodePacked("Adjective", Strings.toString(tokenId)))
        );
        rand = rand % adjectives.length;
        return adjectives[rand];
    }

    function pickRandomColour(uint256 tokenId)
        public
        view
        returns (string memory)
    {
        uint256 rand = random(
            string(abi.encodePacked("Colour", Strings.toString(tokenId)))
        );
        rand = rand % colours.length;
        return colours[rand];
    }

    function pickRandomAnimal(uint256 tokenId)
        public
        view
        returns (string memory)
    {
        uint256 rand = random(
            string(abi.encodePacked("Animal", Strings.toString(tokenId)))
        );
        rand = rand % animals.length;
        return animals[rand];
    }

    function random(string memory input) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(input)));
    }

    function getTotalNFTsMintedSoFar() public view returns (uint256) {
        return _tokenIds.current();
    }

    function makeGenArtNFT() public {
        uint256 newItemId = _tokenIds.current();
        require(newItemId <= maxNFTnum, "All NFTs have been minted");

        string memory first = pickRandomAdjective(newItemId);
        string memory second = pickRandomColour(newItemId);
        string memory third = pickRandomAnimal(newItemId);
        string memory combinedWord = string(
            abi.encodePacked(first, second, third)
        );

        string memory finalSvg = string(
            abi.encodePacked(baseSvg, combinedWord, "</text></svg>")
        );

        // Get all the JSON metadata in place and base64 encode it.
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        combinedWord,
                        '", "description": "A highly acclaimed collection of squares.", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(finalSvg)),
                        '"}'
                    )
                )
            )
        );

        string memory finalTokenUri = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        console.log("\n--------------------");
        console.log(finalTokenUri);
        console.log("--------------------\n");

        // Mint NFT to the user
        _safeMint(msg.sender, newItemId);

        // Set NFT data
        _setTokenURI(newItemId, finalTokenUri);

        // Increment the counter for when the next NFT is minted.
        _tokenIds.increment();

        console.log(
            "An NFT with ID %s has been minted to %s",
            newItemId,
            msg.sender
        );

        emit NewGenArtNFTMinted(msg.sender, newItemId);
    }
}
