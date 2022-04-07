/*jshint esversion: 9 */

const MMTPropertiesLayout = [              // 0
    { name: "counter", bits: 48 },         // 48
    { name: "special2", bits: 8 },         // 56
    { name: "special1", bits: 8 },         // 64
    { name: "effect", bits: 8 },           // 72
    { name: "luck", bits: 16 },            // 88
    { name: "stat3", bits: 16 },           // 104
    { name: "stat2", bits: 16 },           // 120
    { name: "stat1", bits: 16 },           // 136
    { name: "driverNumber", bits: 16 },    // 152
    { name: "label", bits: 16 },           // 168
    { name: "track", bits: 8 },            // 176
    { name: "rarity", bits: 8 },           // 184
    { name: "team", bits: 8 },             // 192
    { name: "model", bits: 8 },            // 200
    { name: "padding2", bits: 24 },        // 224
////////////////// class id //////////////////////////////
    { name: "season", bits: 8 },           // 232
    { name: "subType", bits: 8 },          // 240
    { name: "type", bits: 8 },             // 248
    { name: "padding1", bits: 7 },         // 255
    { name: "nfFlag", bits: 1 }            // 256 
]

const TokenTypes = {
    None: 0,
    Car: 1,
    Driver: 2,
    Part: 3,
    Gear: 4,
    Tyres: 5
}

const TokenTypeToString = {
    0: "None",
    1: "Car",
    2: "Driver",
    3: "Part",
    4: "Gear",
    5: "Tyres"
}

const TokenSubTypes = {
    Car: {
        None: 0
    },
    Driver: {
        None: 0
    },
    Part: {
        None: 0,
        EngineBlock: 1,
        Turbocharger: 2,
        FrontWing: 3,
        RearWing: 4,
        EnergyStore: 5,
        Brakes: 6,
        Transmission: 7,
        Suspension: 8
    },
    Gear: {
        None: 0,
        Gloves: 1,
        Suit: 2,
        Helmet: 3,
        Boots: 4
    },
    Tyres: {
        None: 0,
        Soft: 1,
        Medium: 2,
        Hard: 3,
        Intermediate: 4,
        Wet: 5,
    }
}

const TokenSubTypeToString = {
    1: {
        0: "None"
    },
    2: {
        0: "None"
    },
    3: {
        0: "None",
        1: "EngineBlock",
        2: "Turbocharger",
        3: "FrontWing",
        4: "RearWing",
        5: "EnergyStore",
        6: "Brakes",
        7: "Transmission",
        8: "Suspension"
    },
    4: {
        0: "None",
        1: "Gloves",
        2: "Suit",
        3: "Helmet",
        4: "Boots"
    },
    5: {
        0: "None",
        1: "Soft",
        2: "Medium",
        3: "Hard",
        4: "Intermediate",
        5: "Wet"
    }
}

const TokenTiers = {
    "Apex": [0],
    "Legendary": [1],
    "Epic": [2,3],
    "Rare": [4,5,6],
    "Common": [7,8,9]
};

module.exports = {
    TokenTypes,
    TokenSubTypes,
    MMTPropertiesLayout,
    TokenTypeToString,
    TokenSubTypeToString,
    TokenTiers
 };