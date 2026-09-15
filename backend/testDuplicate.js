require("dotenv").config();

const {
    checkDuplicate,
    jaccardSimilarity
} = require("./services/duplicateService");


const existingProblems = [

    {
        id: "TEST001",

        description:
            "Farmers in our village do not have enough irrigation water for vegetable cultivation.",

        location:
            "Ranchi"
    },

    {
        id: "TEST002",

        description:
            "The main road in our locality is badly damaged and full of potholes.",

        location:
            "Jamshedpur"
    },

    {
        id: "TEST003",

        description:
            "People in Ward 4 have not received drinking water for five days.",

        location:
            "Ranchi, Ward 4"
    }

];


const tests = [

    // =====================================
    // TEST 1 — EXACT DUPLICATE
    // =====================================

    {
        name:
            "Exact duplicate",

        description:
            "Farmers in our village do not have enough irrigation water for vegetable cultivation.",

        location:
            "Ranchi",

        expected:
            true
    },


    // =====================================
    // TEST 2 — DIFFERENT WORDING
    // =====================================

    {
        name:
            "Different wording duplicate",

        description:
            "Village farmers are unable to grow vegetables because their fields lack sufficient irrigation water.",

        location:
            "Ranchi",

        expected:
            true
    },


    // =====================================
    // TEST 3 — ROAD DUPLICATE
    // =====================================

    {
        name:
            "Different wording road duplicate",

        description:
            "Our locality's main road has many potholes and is in very poor condition.",

        location:
            "Jamshedpur",

        expected:
            true
    },


    // =====================================
    // TEST 4 — UNRELATED
    // =====================================

    {
        name:
            "Unrelated complaint",

        description:
            "The local school does not have enough teachers for the students.",

        location:
            "Ranchi",

        expected:
            false
    },


    // =====================================
    // TEST 5 — SAME CATEGORY BUT DIFFERENT
    // =====================================

    {
        name:
            "Same category but different problem",

        description:
            "Farmers are unable to sell their crops because there is no nearby market.",

        location:
            "Ranchi",

        expected:
            false
    },


    // =====================================
    // TEST 6 — WATER BUT DIFFERENT PROBLEM
    // =====================================

    {
        name:
            "Same water topic but different problem",

        description:
            "A factory is dumping chemicals into the river and polluting the water.",

        location:
            "Ranchi",

        expected:
            false
    }

];


const runTests = async () => {

    console.log(
        "\n===================================="
    );

    console.log(
        "DUPLICATE DETECTION TESTS"
    );

    console.log(
        "====================================\n"
    );


    let passed = 0;


    for (
        const test of tests
    ) {

        console.log(
            `Testing: ${test.name}`
        );


        const result =
            await checkDuplicate(
                {
                    description:
                        test.description,

                    location:
                        test.location
                },

                existingProblems
            );


        const passedTest =
            result.duplicateFound ===
            test.expected;


        if (passedTest) {

            passed++;

            console.log(
                "PASS"
            );

        } else {

            console.log(
                "FAIL"
            );

        }


        console.log(
            "Expected:",
            test.expected
        );

        console.log(
            "Got:",
            result.duplicateFound
        );

        console.log(
            "Matched:",
            result.duplicateOf
        );

        console.log(
            "Confidence:",
            result.confidence
        );

        console.log(
            "------------------------------------"
        );

    }


    console.log(
        `\nRESULT: ${passed}/${tests.length} tests passed.\n`
    );

};


runTests();