import { beforeAll, describe, test, expect } from "vitest";
import hljs from "highlight.js";
import { parseFragment } from "parse5";
import hljsDefineSolidity from "../src/languages/solidity";

// Removing the `hljs-` default prefix, to make it easier to test.
hljs.configure({ classPrefix: "" });

// Receives a Solidity snippet and returns an array of [type, text] tuples.
// Type is the detected token type, and text the corresponding source text.
function getTokens(source: string, language = "sol"): [string, string][] {
  const { value } = hljs.highlight(source, { language });
  console.log(value);

  const fragment = parseFragment(value);

  return fragment.childNodes.map(node => {
    if ("value" in node) {
      return ["none", node.value];
    }
    if ("attrs" in node) {
      const type = node.attrs.find(a => a.name === "class")?.value ?? "none";

      if (node.childNodes.length === 1 && "value" in node.childNodes[0]) {
        return [type, node.childNodes[0].value];
      }
    }
    return ["none", ""];
  });
}

beforeAll(() => {
  hljs.registerLanguage("sol", hljsDefineSolidity);
});
test.each([
  "-1",
  "654_321",
  "54_321",
  "4_321",
  "5_43_21",
  "1_2e10",
  "12e1_0",
  "3.14_15",
  "3_1.4_15",
  "0x8765_4321",
  "0x765_4321",
  "0x65_4321",
  "0x5_4321",
  "0x123_1234_1234_1234",
  "0x123456_1234_1234",
  "0X123",
  "0xffffff",
  "0xfff_fff",
])(`numbers ok %s`, number =>
  expect(getTokens(number)).toEqual([["number", number]]),
);
test.each([
  "1234_",
  "12__34",
  "12_e34",
  "12e_34",
  "3.1415_",
  "3__1.4__15",
  "3__1.4__15",
  "1._2",
  "1.2e_12",
  "1._",
  "0x1234__1234__1234__123",
])(`numbers fail %s`, number =>
  expect(getTokens(number)).not.toEqual([["number", number]]),
);

test.each(["msg", "block", "tx", "abi"])(`built-in ok %s`, keyword =>
  expect(getTokens(keyword)).toEqual([["built_in", keyword]]),
);

test.each(["object", "code", "data"])(`yul keywords ok %s`, keyword =>
  expect(getTokens(keyword)).toEqual([["keyword", keyword]]),
);

test("identifier with dollar sign", () => {
  expect(getTokens("id$1")).toEqual([["none", "id$1"]]);
  expect(getTokens("id$tx")).toEqual([["none", "id$tx"]]);
});

// test.each([
//   [
//     "pragma solidity ^0.8.0",
//     '<span class="meta"><span class="keyword">pragma</span> <span class="keyword">solidity</span> ^0.8.0</span>',
//   ],
//   [
//     "abstract contract AccessControl is Context, IAccessControl, ERC165 {",
//     '<span class="keyword">abstract</span> <span class="class"><span class="keyword">contract</span> <span class="title">AccessControl</span> <span class="keyword">is</span> <span class="title">Context</span>, <span class="title">IAccessControl</span>, <span class="title">ERC165</span> </span>{',
//   ],
//   [
//     'import "./IAccessControl.sol";',
//     '<span class="keyword">import</span> <span class="string">&quot;./IAccessControl.sol&quot;</span>;',
//   ],
//   [
//     "mapping(bytes32 => RoleData) private _roles;",
//     '<span class="keyword">mapping</span>(<span class="keyword">bytes32</span> <span class="operator">=</span><span class="operator">&gt;</span> RoleData) <span class="keyword">private</span> _roles;',
//   ],
//   [
//     "bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;",
//     '<span class="keyword">bytes32</span> <span class="keyword">public</span> <span class="keyword">constant</span> DEFAULT_ADMIN_ROLE <span class="operator">=</span> <span class="number">0x00</span>;',
//   ],
//   [
//     "function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {",
//     '<span class="function"><span class="keyword">function</span> <span class="title">supportsInterface</span>(<span class="params"><span class="keyword">bytes4</span> interfaceId</span>) <span class="title"><span class="keyword">public</span></span> <span class="title"><span class="keyword">view</span></span> <span class="title"><span class="keyword">virtual</span></span> <span class="title"><span class="keyword">override</span></span> <span class="title"><span class="keyword">returns</span></span> (<span class="params"><span class="keyword">bool</span></span>) </span>{',
//   ],
// ])("%s -> %s", (input, output) =>
//   expect(
//     hljs.highlight(input, {
//       language: "sol",
//     }).value,
//   ).toBe(output),
// );
