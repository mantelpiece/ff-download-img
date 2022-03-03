import { describe, it } from "@jest/globals"


import { extractCollection, extractSimpleFilename } from "./content_page.js"


describe("extractCollection", () => {
    describe("given a string URL with no path", () => {
        it("returns an empty string", () => {
            expect(extractCollection("https://www.foo.com")).toEqual("")
            expect(extractCollection("https://www.foo.com/")).toEqual("")
        });
    });

    describe("given a string URL with a single, non-nested path", () => {
        it("returns the path as the collection", () => {
            expect(extractCollection("https://www.foo.com/page")).toEqual("page")
            expect(extractCollection("https://www.foo.com/page/")).toEqual("page")
        });
    });

    describe("given a string URL with a single, non-nested path including a number id", () => {
        it("returns the number id, padded to 3 characters", () => {
            expect(extractCollection("https://www.foo.com/page-01")).toEqual("c001")
            expect(extractCollection("https://www.foo.com/page_3/")).toEqual("c003")
        });
    });

    describe("given a string URL with a single, non-nested path including multiple number ids", () => {
        it("returns the first number id, padded to 3 characters", () => {
            expect(extractCollection("https://www.foo.com/page-01x123")).toEqual("c001")
            expect(extractCollection("https://www.foo.com/page_3-3/")).toEqual("c003")
        });
    });
    describe("given a string URL with hashes or query string", () => {
        it("ignores hashes and query string", () => {
            expect(extractCollection("https://www.foo.com/page-01x123#hashs")).toEqual("c001")
            expect(extractCollection("https://www.foo.com/page_3-3?a=123")).toEqual("c003")
        });
    });
});


describe("prettifyFilename", () => {
    describe("given a string URL for a filename with no numbers", () => {
        it("returns the filename", () => {
            expect(extractSimpleFilename("https://www.foo.com/1/2/a/foo.jpg")).toEqual("foo.jpg")
            expect(extractSimpleFilename("https://www.foo.com//1/2/a/foo.webp")).toEqual("foo.webp")
        });
    });

    describe("given a string URL for a filename with numbers", () => {
        it("returns the numbers (padded to 3 characters) and extension", () => {
            expect(extractSimpleFilename("https://www.foo.com/1/2/a/foo-1234.jpg")).toEqual("1234.jpg")
            expect(extractSimpleFilename("https://www.foo.com//1/2/a/foo-01.webp")).toEqual("001.webp")
        });
    });

    describe("given a string URL with a for a filename including multiple number ids", () => {
        it("returns everything from the first number and extension", () => {
            expect(extractSimpleFilename("https://www.foo.com/page-01x123.png")).toEqual("01x123.png")
            expect(extractSimpleFilename("https://www.foo.com/page_3-3.png")).toEqual("3-3.png")
        });
    });

    describe("given a string URL with a for a filename without an extension", () => {
        it("defaults to extension of jpg", () => {
            expect(extractSimpleFilename("https://www.foo.com/page-01x123")).toEqual("01x123.jpg")
            expect(extractSimpleFilename("https://www.foo.com/page_3-3")).toEqual("3-3.jpg")
        });
    });

    describe("given a string URL with a hash or query strings", () => {
        it("ignores hash and query strings", () => {
            expect(extractSimpleFilename("https://www.foo.com/page-01x123.png#dfd")).toEqual("01x123.png")
            expect(extractSimpleFilename("https://www.foo.com/page_3-3.png?a=1")).toEqual("3-3.png")
        });
    });
});
