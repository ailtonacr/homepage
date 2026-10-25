import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const cases = readdirSync(join(root, "src/content/projects"))
  .filter(name => name.endsWith(".mdx")).map(name => name.slice(0,-4)).sort();
const enCases = readdirSync(join(root, "src/content/projects/en"))
  .filter(name => name.endsWith(".mdx")).map(name => name.slice(0,-4)).sort();
assert.deepEqual(enCases, cases, "Every Portuguese case study must have an English counterpart");

function built(path) {
  const index = join(dist, path, "index.html");
  const flat = join(dist, path ? path + ".html" : "index.html");
  const target = existsSync(index) ? index : flat;
  assert.ok(existsSync(target), "Missing generated page: " + path);
  return readFileSync(target, "utf8");
}
const ptPaths = ["","projetos","sobre","contato","privacidade","404",...cases.map(slug=>"projetos/"+slug)];
const enPaths = ["","projects","about","contact","privacy","404",...cases.map(slug=>"projects/"+slug)];
for (const [locale,paths] of [["pt",ptPaths],["en",enPaths]]) {
  for(const path of paths) {
    const html = built(locale === "en" ? join("en",path) : path);
    assert.ok(html.includes('lang="' + (locale === "pt" ? "pt-BR" : "en") + '"'),"Document language "+path);
    for(const code of ['pt-BR','en','x-default']) assert.ok(html.includes('hreflang="'+code+'"'),"Alternate "+code+" on "+path);
    assert.ok(html.includes('rel="canonical"'),"Canonical "+path);
    assert.ok(html.includes('name="description"'),"Description "+path);
    assert.ok(html.includes('data-language-choice="pt"') && html.includes('data-language-choice="en"'),"Switcher "+path);
  }
}
assert.ok(built("en").includes("Good ideas deserve"),"English home copy missing");
assert.ok(built("").includes("Boas ideias merecem"),"Portuguese home copy missing");
assert.ok(built("en/projects/pastemax").includes("The problem"),"English case study missing");
assert.ok(built("projetos/pastemax").includes("O problema"),"Portuguese case study missing");
assert.ok(built("en/privacy").includes("Visitor analytics"),"English privacy text missing");
assert.ok(built("privacidade").includes("Estatísticas de acesso"),"Portuguese privacy text missing");

const bootstrap=[...built("").matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
  .map(m=>m[1]).find(text=>text.includes("ailton:site-language:v1"));
assert.ok(bootstrap,"Real language detection script not found in built HTML");
function browser({pathname, languages, preference, cookie=""}) {
  let redirect=null; let click;
  const storage = new Map(preference ? [["ailton:site-language:v1",preference]] : []);
  const location={pathname,search:"?sample=1",hash:"#section",replace:(p)=>{redirect=p;}};
  const document={cookie,addEventListener:(event,fn)=>{if(event==="click")click=fn;}};
  const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)};
  vm.runInNewContext(bootstrap,{location,document,localStorage,navigator:{languages,language:languages[0]}});
  return {redirect,click,storage,document};
}
assert.equal(browser({pathname:"/",languages:["en-US"]}).redirect,"/en/?sample=1#section");
assert.equal(browser({pathname:"/en/",languages:["pt-BR"]}).redirect,"/?sample=1#section");
assert.equal(browser({pathname:"/projetos/pastemax/",languages:["en-GB"]}).redirect,"/en/projects/pastemax/?sample=1#section");
assert.equal(browser({pathname:"/en/projects/pastemax/",languages:["en-US"],preference:"pt"}).redirect,"/projetos/pastemax/?sample=1#section");
assert.equal(browser({pathname:"/sobre/",languages:["pt-BR"],preference:"en"}).redirect,"/en/about/?sample=1#section");
assert.equal(browser({pathname:"/contato/",languages:["fr-FR"]}).redirect,null);
const selected=browser({pathname:"/en/about/",languages:["en-US"]});
assert.equal(typeof selected.click,"function");
selected.click({target:{closest:()=>({dataset:{languageChoice:"pt"}})}});
assert.equal(selected.storage.get("ailton:site-language:v1"),"pt");
assert.match(selected.document.cookie,/site_lang=pt/);
assert.ok(built("en").includes("og-en.svg"),"English OG image missing");
console.log("Passed: 24 localized routes, 6 bilingual case studies, navigator detection, manual override, and deep-link routing.");
