"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var generateChunksText = function (sentences) {
  var chunks = sentences.map(function (sentence, index) {
    return "`" + sentence.trim() + ".`";
  });
  return "export const chunks = [\n  " + chunks.join(",\n  ") + "\n];";
};
var textFilePath = "book.txt";
var text = fs_1.readFileSync(textFilePath, "utf-8");
// Split the text into sentences at each full stop
var sentences = text.split(".").map(function (sentence) {
  return sentence.trim();
});
// Filter out any empty strings resulting from consecutive full stops
var filteredSentences = sentences.filter(function (sentence) {
  return sentence !== "";
});
// Generate the chunks text
var chunksText = generateChunksText(filteredSentences);
// Write the chunks text to a new file
var outputPath = "src/app/chunks-TFPG.ts";
fs_1.writeFileSync(outputPath, chunksText);
console.log("Chunks text has been written to " + outputPath);
