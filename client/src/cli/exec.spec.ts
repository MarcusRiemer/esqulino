// TODO: Re-enable this testcase that is borked with Angular 12 `ng test`
//       This is probably due the update of Webpack to version 5 which
//       no longer ships nodejs Polyfills to browser builds. As this spec
//       imports nodejs code it no longer runs in the browser.

// import { executeCommand } from "./exec";

// describe(`CLI`, () => {
//   describe(`emit`, () => {
//     it(`doesn't crash on exceptions in the generator`, async () => {
//       // This is a grammar that attempts to visualize an unknown node, this
//       // should crash the emitter as a side effect
//       const res = await executeCommand({
//         type: "emitCode",
//         ast: {
//           name: "grammar",
//           language: "MetaGrammar",
//           properties: {
//             name: "vis",
//           },
//           children: {
//             nodes: [
//               {
//                 name: "visualizeNode",
//                 language: "MetaGrammar",
//               },
//             ],
//           },
//         },
//         languageId: "meta-grammar",
//       });

//       expect(res).toMatch(/Error:.*visualize.*/);
//     });
//   });
// });
