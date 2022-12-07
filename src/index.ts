import type { HLJSApi } from "highlight.js";
import solidityGrammar from "./languages/solidity.js";
import yulGrammar from "./languages/yul.js";

export default function (hljs: HLJSApi) {
  hljs.registerLanguage("solidity", solidityGrammar);
  hljs.registerLanguage("yul", yulGrammar);
}

export { solidityGrammar as solidity, yulGrammar as yul };
