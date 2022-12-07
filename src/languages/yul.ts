import type { HLJSApi, Language } from "highlight.js";

import {
  SOL_ASSEMBLY_KEYWORDS,
  baseAssembly,
  isNegativeLookbehindAvailable,
} from "../common";

function hljsDefineYul(hljs: HLJSApi): Language {
  const YUL_KEYWORDS = {
    keyword: SOL_ASSEMBLY_KEYWORDS.keyword + " " + "object code data",
    built_in:
      SOL_ASSEMBLY_KEYWORDS.built_in +
      " " +
      "datasize dataoffset datacopy " +
      "setimmutable loadimmutable " +
      "linkersymbol memoryguard",
    literal: SOL_ASSEMBLY_KEYWORDS.literal,
  };

  let YUL_VERBATIM_RE: string | RegExp =
    /\bverbatim_[1-9]?[0-9]i_[1-9]?[0-9]o\b(?!\$)/;

  if (isNegativeLookbehindAvailable()) {
    //replace just first \b
    YUL_VERBATIM_RE = YUL_VERBATIM_RE.source.replace(/\\b/, "(?<!\\$)\\b");
  }

  //highlights the "verbatim" builtin. making a separate mode for this due to
  //its variability.
  const YUL_VERBATIM_MODE = {
    className: "built_in",
    begin: YUL_VERBATIM_RE,
  };

  const BASE_ASSEMBLY_ENVIRONMENT = baseAssembly(hljs);

  return {
    aliases: ["yul"],
    keywords: YUL_KEYWORDS,
    contains: [
      hljs.inherit(BASE_ASSEMBLY_ENVIRONMENT, {
        contains: [
          ...(BASE_ASSEMBLY_ENVIRONMENT.contains ?? []),
          YUL_VERBATIM_MODE,
        ],
      }),
    ],
  };
}

export default hljsDefineYul;
