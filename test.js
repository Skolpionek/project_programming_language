import assert from 'assert';
import { interprete } from './main.js';
import fs from 'fs';

const testModuleName = "temp_test_module.txt";
const testModuleContent = `
   =(secretNumber:num, 42);
   =(double, func(x, *(x, 2)));
`;
fs.writeFileSync(testModuleName, testModuleContent);

const regression_tests = [
   // ==========================================
   // 1. MATHEMATICS (Basics and Edge Cases)
   // ==========================================
   { name: "Adding multiple arguments", code: "+(1, 2, 3, 4, 5)", expected: 15 },
   { name: "Subtraction with negative result", code: "-(5, 15)", expected: -10 },
   { name: "Parsing negative numbers", code: "+(-5, -10)", expected: -15 }, 
   { name: "Division with float result", code: "/(10, 4)", expected: 2.5 },
   { name: "Complex order of operations", code: "-(*(+(2, 3), 4), /(10, 2))", expected: 15 }, 
   { name: "Exponentiation to zero", code: "^(5, 0)", expected: 1 },
   { name: "Nested exponentiation", code: "^(2, ^(2, 2))", expected: 16 },
   { name: "Floating-point mathematics", code: "*(0.5, 4)", expected: 2 },
   
   // ==========================================
   // 2. LOGIC AND COMPARISONS
   // ==========================================
   { name: "Chained comparisons (True)", code: "<(1, 5, 10, 20)", expected: true },
   { name: "Chained comparisons (False)", code: "<(1, 5, 3, 20)", expected: false },
   { name: "Complex AND/OR logic", code: "or(and(true, false), and(true, true))", expected: true },
   { name: "Nested negation", code: "not(not(true))", expected: true },
   { name: "Boolean comparison", code: "==(true, true)", expected: true },
   { name: "String comparison", code: "==(\"test\", \"test\")", expected: true },
   { name: "OR Short-circuit evaluation", code: "=(x:num, 0); or(true, ++(x)); x", expected: 0 }, 

   // ==========================================
   // 3. VARIABLES, TYPING AND SCOPE
   // ==========================================
   { name: "Variable declaration (num)", code: "=(x:num, 10); x", expected: 10 },
   { name: "Variable update", code: "=(y:num, 5); =(y, 15); y", expected: 15 },
   { name: "Arithmetic shortcuts", code: "=(z:num, 1); ++(z); z", expected: 2 },
   { name: "Decrement below zero", code: "=(z:num, 0); --(z); z", expected: -1 },
   { name: "Type 'any' on the fly", code: "=(a:any, 5); =(a, list(1, 2)); a.len", expected: 2 },
   { name: "Variable shadowing in functions", code: "=(x:num, 10); =(f, func(x, +(x, 5))); f(20)", expected: 25 },
   { name: "Nested DO block and Scope", code: "=(x:num, 1); do(=(x, 2), =(y:num, 3)); x", expected: 2 },
   { name: "FOR loop scope isolation", code: "=(i:num, 99); for(=(i:num, 0); <(i, 2); ++(i); 1); i", expected: 99 },

   // ==========================================
   // 4. CONTROL FLOW
   // ==========================================
   { name: "IF statement (True branch)", code: "if(true, 100, 200)", expected: 100 },
   { name: "IF statement (False branch)", code: "if(false, 100, 200)", expected: 200 },
   { name: "Nested IF", code: "if(>(10, 5), if(==(1, 1), 42, 0), 0)", expected: 42 },
   { name: "Missing false branch in IF", code: "if(false, 100)", expected: false }, 
   { name: "Empty DO statement", code: "do()", expected: false },
   { name: "WHILE loop", code: "=(i:num, 0); while(<(i, 5), ++(i)); i", expected: 5 },
   { name: "WHILE loop (Skip - false on start)", code: "=(x:num, 0); while(false, ++(x)); x", expected: 0 },
   { name: "Nested WHILE loop", code: "=(i:num,0); =(sum:num,0); while(<(i,3), do(=(j:num,0), while(<(j,3), do(++(sum), ++(j))), ++(i))); sum", expected: 9 },

   // ==========================================
   // 5. FUNCTIONS AND CLOSURES
   // ==========================================
   { name: "Simple function", code: "=(add, func(a, b, +(a,b))); add(2, 2)", expected: 4 },
   { name: "Function without arguments", code: "=(get5, func(5)); get5()", expected: 5 },
   { name: "Lexical scope (Closure)", code: "=(makeAdder, func(x, func(y, +(x,y)))); =(add10, makeAdder(10)); add10(5)", expected: 15 },
   { name: "Multiple Closures", code: "=(multiplier, func(x, func(y, *(x,y)))); =(times3, multiplier(3)); times3(4)", expected: 12 },
   { name: "Recursion (Factorial)", code: "=(factorial, func(n, if(<=(n, 1), 1, *(n, factorial(-(n, 1)))))); factorial(5)", expected: 120 },
   { name: "Function as argument (Higher-Order)", code: "=(execute, func(f, x, f(x))); =(double, func(y, *(y, 2))); execute(double, 5)", expected: 10 },
   { name: "IIFE (Immediately Invoked Function Expression)", code: "=(result, func(x, *(x,x))(5)); result", expected: 25 },

   // ==========================================
   // 6. LISTS AND DATA STRUCTURES
   // ==========================================
   { name: "List creation and retrieval", code: "=(l:list, list(10, 20)); l.get(1)", expected: 20 },
   { name: "Adding to list", code: "=(l:list, list()); l.add(99); l.get(0)", expected: 99 },
   { name: "Length property (len)", code: "=(l:list, list(1, 2, 3)); l.len", expected: 3 },
   { name: "Multidimensional lists (Retrieval)", code: "=(l:list, list(list(1, 2), list(3, 4))); l.get(1).get(0)", expected: 3 },
   { name: "Updating list value", code: "=(l:list, list(10, 20)); l.set(99, 1); l.get(1)", expected: 99 },
   { name: "Dynamic list length after modification", code: "=(l:list, list(1)); l.add(2, 3); l.len", expected: 3 },
   { name: "Removing from list (del)", code: "=(l:list, list(1, 2, 3)); l.del(1); l.len", expected: 2 },
   { name: "List storing mixed types", code: "=(l:list, list(1, \"two\", true)); l.get(1).len", expected: 3 },

   // ==========================================
   // 7. PRIMITIVE METHODS AND PROPERTIES
   // ==========================================
   { name: "String method (upper)", code: "=(s:str, \"hey\"); s.upper", expected: "HEY" },
   { name: "String property (len)", code: "=(s:str, \"test\"); s.len", expected: 4 },
   { name: "Number property (isEven)", code: "=(n:num, 4); n.isEven", expected: true },
   { name: "Property chaining (String)", code: "=(s:str, \"  test  \"); s.trim.upper.len", expected: 4 },
   { name: "Mathematics on properties", code: "=(n:num, -5.5); n.abs.floor", expected: 5 },
   
   // ==========================================
   // 8. MODULES AND IMPORTS
   // ==========================================
   { name: "File import and variable reading", code: `=(mod, import("${testModuleName}")); mod.secretNumber`, expected: 42 },
   { name: "Calling a function from an imported module", code: `=(mod, import("${testModuleName}")); mod.double(10)`, expected: 20 }
];

function testing(tests) {
   let passed = 0;
   let failed = 0;
   let failedNames = [];
   
   tests.forEach(test => {
      try {
         let result = interprete(test.code);
         assert.deepStrictEqual(result, test.expected);
         
         console.log(`✅ PASSED: ${test.name}`);
         passed++;
      } catch (error) {
         console.log(`❌ FAILED: ${test.name}`);
         console.log(`   Expected: ${test.expected}`);
         console.log(`   Error: ${error.message}`);
         failed++;
         failedNames.push(`\n${test.name}`);
      }
   });
   
   console.log("\n--- SUMMARY ---");
   console.log(`Passed: ${passed}`);
   console.log(`Failed: ${failed}`);
   console.log(failedNames.length > 0 ? `List of Failed Tests: ${failedNames.join("")}` : "");

   if (failed > 0) {
      process.exit(1); 
   } else {
      console.log("WORKS!!!");
   }
   
   if (fs.existsSync(testModuleName)) {
      fs.unlinkSync(testModuleName);
   }
}

const unit_tests = [

]

testing(regression_tests);
//testing(unit_tests);